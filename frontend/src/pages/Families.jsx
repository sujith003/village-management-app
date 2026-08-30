import { useEffect, useState } from "react";
import { Search, Users, Plus, Edit, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

function Families() {
  const { t } = useTranslation();
  const toast = useToast();
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    family_name: "",
    head_name: "",
    phone: "",
    alternate_phone: "",
    address: "",
    members_count: "",
  });

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/families/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch families");
      }

      const data = await response.json();
      setFamilies(data);
    } catch (err) {
      console.error(err);
      setError(t("unableToLoadFamilies"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    setEditingFamily(null);

    setFormData({
      family_name: "",
      head_name: "",
      phone: "",
      alternate_phone: "",
      address: "",
      members_count: "",
    });

    setShowModal(true);
  };

  const handleEdit = (family) => {
    setEditingFamily(family);

    setFormData({
      family_name: family.family_name || "",
      head_name: family.head_name || "",
      phone: family.phone || "",
      alternate_phone: family.alternate_phone || "",
      address: family.address || "",
      members_count: family.members_count || "",
    });

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      return;
    }

    setSaving(true);

    try {
      const url = editingFamily
        ? `${API_URL}/api/families/${editingFamily.id}/`
        : `${API_URL}/api/families/`;

      const method = editingFamily ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          family_name: formData.family_name,
          head_name: formData.head_name,
          phone: formData.phone,
          alternate_phone: formData.alternate_phone,
          address: formData.address,
          members_count: Number(formData.members_count),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API error:", data);
        throw new Error("Failed to save family");
      }

      setShowModal(false);
      setEditingFamily(null);

      await fetchFamilies();

      toast.success(
        editingFamily
          ? t("familyUpdatedSuccess")
          : t("familyAddedSuccess")
      );
    } catch (err) {
      console.error(err);
      toast.error(t("unableToSaveFamily"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (family) => {
    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      t("confirmDeleteFamily", { name: family.family_name })
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/families/${family.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete family");
      }

      setFamilies((prev) =>
        prev.filter((item) => item.id !== family.id)
      );

      toast.success(t("familyDeletedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("unableToDeleteFamily"));
    }
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingFamily(null);
  };

  const filteredFamilies = families.filter((family) => {
    const searchText = search.toLowerCase();

    return (
      family.family_name
        ?.toLowerCase()
        .includes(searchText) ||
      family.head_name
        ?.toLowerCase()
        .includes(searchText) ||
      family.phone
        ?.toLowerCase()
        .includes(searchText) ||
      family.alternate_phone
        ?.toLowerCase()
        .includes(searchText) ||
      family.address
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  if (loading) {
    return <p>{t("loadingFamilies")}</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("families")}</h1>
          <p>{t("viewRegisteredFamilies")}</p>
        </div>

        {isAdmin && (
          <button
            className="login-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            {t("addFamily")}
          </button>
        )}
      </div>

      <div className="search-box">
        <Search size={20} />

        <input
          type="text"
          placeholder={t("searchFamilyPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredFamilies.length === 0 ? (
        <div className="no-results">
          <Users size={32} />
          <p>{t("noMatchingFamilies")}</p>
        </div>
      ) : (
        <div className="family-list">
          {filteredFamilies.map((family) => (
            <div
              className="family-card"
              key={family.id}
            >
              <h2>{family.family_name}</h2>

              <p>
                <strong>{t("headName")}:</strong>{" "}
                {family.head_name}
              </p>

              <p>
                <strong>{t("phone")}:</strong>{" "}
                {family.phone}
              </p>

              <p>
                <strong>{t("alternatePhone")}:</strong>{" "}
                {family.alternate_phone ||
                  t("notAvailable")}
              </p>

              <p>
                <strong>{t("address")}:</strong>{" "}
                {family.address}
              </p>

              <p>
                <strong>{t("members")}:</strong>{" "}
                {family.members_count}
              </p>

              {isAdmin && (
                <div className="family-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(family)}
                  >
                    <Edit size={16} />
                    {t("edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(family)
                    }
                  >
                    <Trash2 size={16} />
                    {t("delete")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="payment-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-header">
              <div>
                <h2>
                  {editingFamily
                    ? t("editFamily")
                    : t("addFamily")}
                </h2>

                <p>
                  {editingFamily
                    ? t("updateFamilyDetails")
                    : t("addNewFamily")}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeModal}
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="festival-form"
              onSubmit={handleSubmit}
            >
              <div>
                <label>{t("familyName")}</label>

                <input
                  type="text"
                  name="family_name"
                  value={formData.family_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>{t("headName")}</label>

                <input
                  type="text"
                  name="head_name"
                  value={formData.head_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>{t("phone")}</label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>{t("alternatePhone")}</label>

                <input
                  type="text"
                  name="alternate_phone"
                  value={formData.alternate_phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>{t("membersCount")}</label>

                <input
                  type="number"
                  name="members_count"
                  value={formData.members_count}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label>{t("address")}</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="festival-form-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  {t("cancel")}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? t("saving")
                    : editingFamily
                    ? t("updateFamily")
                    : t("addFamily")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Families;