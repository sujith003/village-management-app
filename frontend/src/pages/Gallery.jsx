import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

function Gallery() {
  const { t } = useTranslation();
  const toast = useToast();
  const [photos, setPhotos] = useState([]);
  const [festivals, setFestivals] = useState([]);

  const [search, setSearch] = useState("");
  const [festivalFilter, setFestivalFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add / Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);

  // Photo preview modal
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [formData, setFormData] = useState({
    festival: "",
    title: "",
    image: null,
    description: "",
  });

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  // =====================================================
  // FETCH PHOTOS
  // =====================================================

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/gallery/`);

      if (!response.ok) {
        throw new Error("Failed to fetch gallery");
      }

      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      console.error("Gallery fetch error:", err);
      setError(t("unableToLoadGallery"));
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH FESTIVALS
  // =====================================================

  const fetchFestivals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/festivals/`);

      if (!response.ok) {
        throw new Error("Failed to fetch festivals");
      }

      const data = await response.json();
      setFestivals(data);
    } catch (err) {
      console.error("Festival fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchFestivals();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredPhotos = photos.filter((photo) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      photo.title?.toLowerCase().includes(searchText) ||
      photo.description?.toLowerCase().includes(searchText);

    const matchesFestival =
      festivalFilter === "" ||
      String(photo.festival) === String(festivalFilter);

    return matchesSearch && matchesFestival;
  });

  // =====================================================
  // GET FESTIVAL NAME
  // =====================================================

  const getFestivalName = (festivalId) => {
    const festival = festivals.find(
      (item) => String(item.id) === String(festivalId)
    );

    if (!festival) {
      return t("unknownFestival");
    }

    return `${festival.festival_name} ${festival.year}`;
  };

  // =====================================================
  // ADD PHOTO
  // =====================================================

  const handleAdd = () => {
    setEditingPhoto(null);

    setFormData({
      festival: "",
      title: "",
      image: null,
      description: "",
    });

    setShowForm(true);
  };

  // =====================================================
  // EDIT PHOTO
  // =====================================================

  const handleEdit = (photo) => {
    setEditingPhoto(photo);

    setFormData({
      festival: photo.festival || "",
      title: photo.title || "",
      image: null,
      description: photo.description || "",
    });

    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    setShowForm(false);
    setEditingPhoto(null);

    setFormData({
      festival: "",
      title: "",
      image: null,
      description: "",
    });
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image") {
      setFormData((previous) => ({
        ...previous,
        image: files?.[0] || null,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD / UPDATE PHOTO
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.festival) {
      toast.error(t("pleaseSelectFestival"));
      return;
    }

    if (!formData.title.trim()) {
      toast.error(t("pleaseEnterPhotoTitle"));
      return;
    }

    if (!editingPhoto && !formData.image) {
      toast.error(t("pleaseSelectImage"));
      return;
    }

    try {
      const data = new FormData();

      data.append("festival", formData.festival);
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());

      if (formData.image) {
        data.append("image", formData.image);
      }

      const url = editingPhoto
        ? `${API_URL}/api/gallery/${editingPhoto.id}/`
        : `${API_URL}/api/gallery/`;

      const method = editingPhoto ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        let errorData = {};

        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }

        console.error("Gallery API error:", errorData);

        throw new Error("Failed to save photo");
      }

      await fetchPhotos();
      closeForm();

      toast.success(
        editingPhoto
          ? t("photoUpdatedSuccess")
          : t("photoAddedSuccess")
      );
    } catch (err) {
      console.error("Save photo error:", err);
      toast.error(t("unableToSavePhoto"));
    }
  };

  // =====================================================
  // DELETE PHOTO
  // =====================================================

  const handleDelete = async (photo) => {
    const confirmed = window.confirm(
      t("confirmDeletePhoto", { title: photo.title })
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/gallery/${photo.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotos((previous) =>
        previous.filter((item) => item.id !== photo.id)
      );

      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null);
      }

      toast.success(t("photoDeletedSuccess"));
    } catch (err) {
      console.error("Delete photo error:", err);
      toast.error(t("unableToDeletePhoto"));
    }
  };

  // =====================================================
  // PHOTO PREVIEW
  // =====================================================

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoPreview = () => {
    setSelectedPhoto(null);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <p>{t("loadingGallery")}</p>;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">
        <div>
          <h1>{t("gallery")}</h1>
          <p>{t("viewFestivalPhotos")}</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="login-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            {t("addPhoto")}
          </button>
        )}
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="search-box">
        <Search size={20} />

        <input
          type="text"
          placeholder={t("searchPhotoPlaceholder")}
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* =================================================
          FESTIVAL FILTER
      ================================================= */}

      <div className="filter-box">
        <select
          value={festivalFilter}
          onChange={(event) =>
            setFestivalFilter(event.target.value)
          }
        >
          <option value="">{t("allFestivals")}</option>

          {festivals.map((festival) => (
            <option
              key={festival.id}
              value={festival.id}
            >
              {festival.festival_name}{" "}
              {festival.year}
            </option>
          ))}
        </select>
      </div>

      {/* =================================================
          GALLERY LIST
      ================================================= */}

      {filteredPhotos.length === 0 ? (
        <div className="no-results">
          <ImageIcon size={32} />
          <p>{t("noGalleryPhotosFound")}</p>
        </div>
      ) : (
        <div className="gallery-list">
          {filteredPhotos.map((photo) => (
            <div
              className="gallery-card"
              key={photo.id}
            >
              {/* PHOTO */}

              <div
                className="gallery-image-container"
                onClick={() =>
                  handlePhotoClick(photo)
                }
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="gallery-image"
                />

                <div className="image-overlay">
                  {t("clickToView")}
                </div>
              </div>

              {/* DETAILS */}

              <div className="gallery-content">
                <h2>{photo.title}</h2>

                <p>
                  <strong>{t("festival")}:</strong>{" "}
                  {getFestivalName(photo.festival)}
                </p>

                <p>
                  <strong>{t("description")}:</strong>{" "}
                  {photo.description ||
                    t("noDescriptionAvailable")}
                </p>

                {/* ADMIN BUTTONS */}

                {isAdmin && (
                  <div className="gallery-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(photo)
                      }
                    >
                      <Edit size={16} />
                      {t("edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(photo)
                      }
                    >
                      <Trash2 size={16} />
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (
        <div
          className="modal-overlay"
          onClick={closeForm}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingPhoto
                    ? t("editGalleryPhoto")
                    : t("addGalleryPhoto")}
                </h2>

                <p>
                  {editingPhoto
                    ? t("updatePhotoDetails")
                    : t("addNewFestivalPhoto")}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* FESTIVAL */}

              <div className="form-group">
                <label>{t("festival")}</label>

                <select
                  name="festival"
                  value={formData.festival}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t("selectFestival")}</option>

                  {festivals.map((festival) => (
                    <option
                      key={festival.id}
                      value={festival.id}
                    >
                      {festival.festival_name}{" "}
                      {festival.year}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE */}

              <div className="form-group">
                <label>{t("title")}</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t("enterPhotoTitle")}
                  required
                />
              </div>

              {/* IMAGE */}

              <div className="form-group">
                <label>
                  {t("image")}{" "}
                  {editingPhoto &&
                    t("optionalKeepExistingImage")}
                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required={!editingPhoto}
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>{t("description")}</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t("enterDescription")}
                  rows="4"
                />
              </div>

              {/* FORM BUTTONS */}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeForm}
                >
                  {t("cancel")}
                </button>

                <button type="submit">
                  {editingPhoto
                    ? t("updatePhoto")
                    : t("addPhoto")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          PHOTO VIEW MODAL
      ================================================= */}

      {selectedPhoto && (
        <div
          className="photo-view-overlay"
          onClick={closePhotoPreview}
        >
          <div
            className="photo-view-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="photo-view-close"
              onClick={closePhotoPreview}
            >
              <X size={24} />
            </button>

            <img
              src={selectedPhoto.image}
              alt={selectedPhoto.title}
              className="photo-view-image"
            />

            <div className="photo-view-details">
              <h2>{selectedPhoto.title}</h2>

              <p>
                <strong>{t("festival")}:</strong>{" "}
                {getFestivalName(
                  selectedPhoto.festival
                )}
              </p>

              <p>
                {selectedPhoto.description ||
                  t("noDescriptionAvailable")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;