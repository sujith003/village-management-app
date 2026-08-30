import { useEffect, useState } from "react";
import {
  Search,
  Megaphone,
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

const EMPTY_FORM = {
  title: "",
  message: "",
  priority: "MEDIUM",
  announcement_date: "",
  is_active: true,
};

function Announcements() {
  const { t } = useTranslation();
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const priorityLabel = (value) => {
    if (value === "HIGH") return t("high");
    if (value === "MEDIUM") return t("medium");
    if (value === "LOW") return t("low");
    return value;
  };

  // =====================================================
  // FETCH ANNOUNCEMENTS
  // =====================================================

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/announcements/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await response.json();

      setAnnouncements(data);
    } catch (err) {
      console.error("Announcement fetch error:", err);
      setError(t("unableToLoadAnnouncements"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredAnnouncements = announcements.filter(
    (announcement) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        announcement.title
          ?.toLowerCase()
          .includes(searchText) ||
        announcement.message
          ?.toLowerCase()
          .includes(searchText);

      const matchesPriority =
        priority === "ALL" ||
        announcement.priority === priority;

      return matchesSearch && matchesPriority;
    }
  );

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const handleAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
    setError("");
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);

    setFormData({
      title: announcement.title || "",
      message: announcement.message || "",
      priority: announcement.priority || "MEDIUM",
      announcement_date:
        announcement.announcement_date || "",
      is_active: announcement.is_active ?? true,
    });

    setShowForm(true);
    setError("");
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
  };

  // =====================================================
  // FORM INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // ADD / UPDATE ANNOUNCEMENT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError(t("pleaseEnterAnnouncementTitle"));
      return;
    }

    if (!formData.message.trim()) {
      setError(t("pleaseEnterAnnouncementMessage"));
      return;
    }

    if (!formData.announcement_date) {
      setError(t("pleaseSelectAnnouncementDate"));
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/api/announcements/${editingId}/`
        : `${API_URL}/api/announcements/`;

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          message: formData.message.trim(),
          priority: formData.priority,
          announcement_date:
            formData.announcement_date,
          is_active: formData.is_active,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        console.error("API error:", errorData);

        throw new Error(
          editingId
            ? t("failedToUpdateAnnouncement")
            : t("failedToCreateAnnouncement")
        );
      }

      await fetchAnnouncements();

      handleCloseForm();

      toast.success(
        editingId
          ? t("announcementUpdatedSuccess")
          : t("announcementAddedSuccess")
      );
    } catch (err) {
      console.error("Save announcement error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE ANNOUNCEMENT
  // =====================================================

  const handleDelete = async (announcement) => {
    const confirmDelete = window.confirm(
      t("confirmDeleteAnnouncement", { title: announcement.title })
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/announcements/${announcement.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(t("failedToDeleteAnnouncement"));
      }

      setAnnouncements((previous) =>
        previous.filter(
          (item) => item.id !== announcement.id
        )
      );

      toast.success(t("announcementDeletedSuccess"));
    } catch (err) {
      console.error("Delete announcement error:", err);
      setError(t("unableToDeleteAnnouncement"));
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return t("dateNotAvailable");
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <p>{t("loadingAnnouncements")}</p>;
  }

  return (
    <div>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">
        <div>
          <h1>{t("announcements")}</h1>
          <p>{t("latestAnnouncements")}</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="login-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            {t("addAnnouncement")}
          </button>
        )}
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !showForm && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <div className="announcement-controls">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder={t("searchAnnouncementsPlaceholder")}
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value)
          }
        >
          <option value="ALL">{t("allPriorities")}</option>

          <option value="HIGH">{t("high")}</option>

          <option value="MEDIUM">{t("medium")}</option>

          <option value="LOW">{t("low")}</option>
        </select>
      </div>

      {/* =================================================
          ANNOUNCEMENT LIST
      ================================================= */}

      {filteredAnnouncements.length === 0 ? (
        <div className="no-results">
          <Megaphone size={32} />

          <p>{t("noAnnouncementsFound")}</p>
        </div>
      ) : (
        <div className="announcement-list">
          {filteredAnnouncements.map(
            (announcement) => (
              <div
                className={`announcement-card priority-${announcement.priority.toLowerCase()}`}
                key={announcement.id}
              >
                <div className="announcement-header">
                  <div className="announcement-icon">
                    <Megaphone size={22} />
                  </div>

                  <div className="announcement-heading">
                    <h2>
                      {announcement.title}
                    </h2>

                    <span className="priority-badge">
                      {priorityLabel(announcement.priority)}
                    </span>
                  </div>
                </div>

                <p className="announcement-message">
                  {announcement.message}
                </p>

                <div className="announcement-footer">
                  <span>
                    <CalendarDays size={16} />

                    {formatDate(
                      announcement.announcement_date
                    )}
                  </span>

                  <span
                    className={
                      announcement.is_active
                        ? "active-status"
                        : "inactive-status"
                    }
                  >
                    {announcement.is_active
                      ? t("active")
                      : t("inactive")}
                  </span>
                </div>

                {/* =================================================
                    ADMIN ACTIONS
                ================================================= */}

                {isAdmin && (
                  <div className="announcement-admin-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(announcement)
                      }
                    >
                      <Edit size={16} />
                      {t("edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(announcement)
                      }
                    >
                      <Trash2 size={16} />
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (
        <div
          className="announcement-modal-overlay"
          onClick={handleCloseForm}
        >
          <div
            className="announcement-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div className="announcement-modal-header">
              <div>
                <h2>
                  {editingId
                    ? t("editAnnouncement")
                    : t("addAnnouncement")}
                </h2>

                <p>
                  {editingId
                    ? t("updateAnnouncementDetails")
                    : t("createNewAnnouncement")}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={handleCloseForm}
                disabled={saving}
              >
                <X size={22} />
              </button>
            </div>

            {/* FORM */}

            <form
              className="announcement-form"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* TITLE */}

              <div className="form-group">
                <label htmlFor="title">{t("title")}</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder={t("enterAnnouncementTitle")}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* MESSAGE */}

              <div className="form-group">
                <label htmlFor="message">{t("message")}</label>

                <textarea
                  id="message"
                  name="message"
                  placeholder={t("enterAnnouncementMessage")}
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PRIORITY */}

              <div className="form-group">
                <label htmlFor="priority">{t("priority")}</label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="HIGH">{t("high")}</option>

                  <option value="MEDIUM">{t("medium")}</option>

                  <option value="LOW">{t("low")}</option>
                </select>
              </div>

              {/* DATE */}

              <div className="form-group">
                <label htmlFor="announcement_date">{t("announcementDate")}</label>

                <input
                  id="announcement_date"
                  name="announcement_date"
                  type="date"
                  value={
                    formData.announcement_date
                  }
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ACTIVE */}

              <div className="form-checkbox">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                />

                <label htmlFor="is_active">{t("activeAnnouncement")}</label>
              </div>

              {/* FORM ACTIONS */}

              <div className="announcement-form-actions">
                <button
                  type="button"
                  onClick={handleCloseForm}
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
                    : editingId
                    ? t("updateAnnouncement")
                    : t("addAnnouncement")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;