import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  X,
  Phone,
  Mail,
  UserCog,
} from "lucide-react";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

function AdminDetails() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phone: "",
    alternate_phone: "",
    email: "",
    address: "",
    description: "",
    photo: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin-details/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch admin details (${response.status})`);
        }

        const data = await response.json();
        setAdmins(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Admin details error:", err);
          setError(t("unableToLoadAdminDetails"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAdmins();

    return () => controller.abort();
  }, [t]);

  const refetch = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin-details/`);
      if (!response.ok) throw new Error("refetch failed");
      const data = await response.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddForm = () => {
    setEditingAdmin(null);
    setFormData({
      name: "",
      role: "",
      phone: "",
      alternate_phone: "",
      email: "",
      address: "",
      description: "",
      photo: null,
    });
    setShowForm(true);
  };

  const openEditForm = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || "",
      role: admin.role || "",
      phone: admin.phone || "",
      alternate_phone: admin.alternate_phone || "",
      email: admin.email || "",
      address: admin.address || "",
      description: admin.description || "",
      photo: null,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAdmin(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("pleaseEnterName"));
      return;
    }

    if (!formData.role.trim()) {
      toast.error(t("pleaseEnterRole"));
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("role", formData.role);
      payload.append("phone", formData.phone);
      payload.append("alternate_phone", formData.alternate_phone);
      payload.append("email", formData.email);
      payload.append("address", formData.address);
      payload.append("description", formData.description);
      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      const url = editingAdmin
        ? `${API_URL}/api/admin-details/${editingAdmin.id}/`
        : `${API_URL}/api/admin-details/`;

      const response = await fetch(url, {
        method: editingAdmin ? "PATCH" : "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Save failed (${response.status})`);
      }

      await refetch();
      closeForm();
      toast.success(t("adminSavedSuccess"));
    } catch (err) {
      console.error("Admin save error:", err);
      toast.error(t("unableToSaveAdmin"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin) => {
    const confirmed = window.confirm(
      t("confirmDeleteAdmin", { name: admin.name })
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/admin-details/${admin.id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      setAdmins((previous) => previous.filter((item) => item.id !== admin.id));
      toast.success(t("adminDeletedSuccess"));
    } catch (err) {
      console.error("Admin delete error:", err);
      toast.error(t("unableToDeleteAdmin"));
    }
  };

  if (loading) {
    return <p>{t("loadingAdminDetails")}</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="admin-details-page">
      <button type="button" className="back-button" onClick={() => navigate("/more")}>
        <ArrowLeft size={18} />
        {t("back")}
      </button>

      <div className="page-header">
        <div>
          <h1>{t("adminDetails")}</h1>
          <p>{t("adminDetailsSubtitle")}</p>
        </div>

        <img
          src="/vengamoor.png"
          alt=""
          className="header-logo"
          style={{ height: "48px" }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>

      {isAdmin && (
        <div className="admin-details-add-row">
          <button type="button" className="login-button" onClick={openAddForm}>
            <Plus size={18} />
            {t("addAdmin")}
          </button>
        </div>
      )}

      {admins.length === 0 && <p className="no-results">{t("noAdminDetailsFound")}</p>}

      <div className="admin-details-list">
        {admins.map((admin) => (
          <div className="admin-details-card" key={admin.id}>
            <div className="admin-details-photo">
              {admin.photo ? (
                <img src={admin.photo} alt={admin.name} />
              ) : (
                <UserCog size={30} />
              )}
            </div>

            <h3>{admin.name}</h3>
            <span className="admin-role-badge">{admin.role}</span>

            {admin.description && <p>{admin.description}</p>}

            <div className="admin-details-contact">
              {admin.phone && (
                <a href={`tel:${admin.phone}`}>
                  <Phone size={14} />
                  {admin.phone}
                </a>
              )}
              {admin.alternate_phone && (
                <a href={`tel:${admin.alternate_phone}`}>
                  <Phone size={14} />
                  {admin.alternate_phone}
                </a>
              )}
              {admin.email && (
                <a href={`mailto:${admin.email}`}>
                  <Mail size={14} />
                  {admin.email}
                </a>
              )}
            </div>

            {admin.address && (
              <p className="admin-details-address">{admin.address}</p>
            )}

            {isAdmin && (
              <div className="admin-details-actions">
                <button type="button" onClick={() => openEditForm(admin)}>
                  <Edit size={16} />
                  {t("edit")}
                </button>
                <button type="button" onClick={() => handleDelete(admin)}>
                  <Trash2 size={16} />
                  {t("delete")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAdmin ? t("editAdmin") : t("addAdmin")}</h2>
              <button type="button" className="modal-close-button" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t("adminNameLabel")}</label>
                <input
                  type="text"
                  value={formData.name}
                  placeholder={t("enterAdminName")}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("role")}</label>
                <input
                  type="text"
                  value={formData.role}
                  placeholder={t("enterRole")}
                  onChange={(event) =>
                    setFormData({ ...formData, role: event.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("contactNumber")}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  placeholder={t("enterContactNumber")}
                  onChange={(event) =>
                    setFormData({ ...formData, phone: event.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("alternateContactNumber")}</label>
                <input
                  type="tel"
                  value={formData.alternate_phone}
                  placeholder={t("enterAlternateContactNumber")}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      alternate_phone: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("emailAddress")}</label>
                <input
                  type="email"
                  value={formData.email}
                  placeholder={t("enterEmail")}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("addressLabel")}</label>
                <input
                  type="text"
                  value={formData.address}
                  placeholder={t("enterAddress")}
                  onChange={(event) =>
                    setFormData({ ...formData, address: event.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("profilePhoto")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      photo: event.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("shortDescription")}</label>
                <textarea
                  value={formData.description}
                  placeholder={t("enterShortDescription")}
                  onChange={(event) =>
                    setFormData({ ...formData, description: event.target.value })
                  }
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={closeForm}>
                  {t("cancel")}
                </button>
                <button type="submit" disabled={saving}>
                  {saving
                    ? t("saving")
                    : editingAdmin
                    ? t("updateAdmin")
                    : t("addAdmin")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDetails;
