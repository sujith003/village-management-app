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
  User,
} from "lucide-react";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

const ROLE_KEYS = [
  "rolePresident",
  "roleVicePresident",
  "roleNaatamai",
  "roleAssistantNaatamai",
  "roleSecretary",
  "roleTreasurer",
];

function ImportantPersons() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [useCustomRole, setUseCustomRole] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    display_order: 0,
    photo: null,
  });

  const ROLE_OPTIONS = ROLE_KEYS.map((key) => t(key));

  useEffect(() => {
    const controller = new AbortController();

    const fetchPersons = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/important-persons/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch important persons (${response.status})`
          );
        }

        const data = await response.json();
        setPersons(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Important persons error:", err);
          setError(t("unableToLoadImportantPersons"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPersons();

    return () => controller.abort();
  }, [t]);

  const refetch = async () => {
    try {
      const response = await fetch(`${API_URL}/api/important-persons/`);
      if (!response.ok) throw new Error("refetch failed");
      const data = await response.json();
      setPersons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddForm = () => {
    setEditingPerson(null);
    setUseCustomRole(false);
    setFormData({
      name: "",
      role: "",
      phone: "",
      email: "",
      address: "",
      description: "",
      display_order: persons.length,
      photo: null,
    });
    setShowForm(true);
  };

  const openEditForm = (person) => {
    setEditingPerson(person);
    setUseCustomRole(!ROLE_OPTIONS.includes(person.role));
    setFormData({
      name: person.name || "",
      role: person.role || "",
      phone: person.phone || "",
      email: person.email || "",
      address: person.address || "",
      description: person.description || "",
      display_order: person.display_order ?? 0,
      photo: null,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPerson(null);
  };

  const handleRoleSelect = (value) => {
    if (value === "__custom__") {
      setUseCustomRole(true);
      setFormData({ ...formData, role: "" });
    } else {
      setUseCustomRole(false);
      setFormData({ ...formData, role: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("pleaseEnterPersonName"));
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("role", formData.role);
      payload.append("phone", formData.phone);
      payload.append("email", formData.email);
      payload.append("address", formData.address);
      payload.append("description", formData.description);
      payload.append("display_order", formData.display_order || 0);
      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      const url = editingPerson
        ? `${API_URL}/api/important-persons/${editingPerson.id}/`
        : `${API_URL}/api/important-persons/`;

      const response = await fetch(url, {
        method: editingPerson ? "PATCH" : "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Save failed (${response.status})`);
      }

      await refetch();
      closeForm();
      toast.success(t("personSavedSuccess"));
    } catch (err) {
      console.error("Important person save error:", err);
      toast.error(t("unableToSavePerson"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (person) => {
    const confirmed = window.confirm(
      t("confirmDeletePerson", { name: person.name })
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/important-persons/${person.id}/`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      setPersons((previous) =>
        previous.filter((item) => item.id !== person.id)
      );
      toast.success(t("personDeletedSuccess"));
    } catch (err) {
      console.error("Important person delete error:", err);
      toast.error(t("unableToDeletePerson"));
    }
  };

  if (loading) {
    return <p>{t("loadingImportantPersons")}</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  const sortedPersons = [...persons].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  return (
    <div className="important-persons-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/more")}
      >
        <ArrowLeft size={18} />
        {t("back")}
      </button>

      <div className="page-header">
        <div>
          <h1>{t("importantPersons")}</h1>
          <p>{t("importantPersonsSubtitle")}</p>
        </div>

        {isAdmin && (
          <button type="button" className="login-button" onClick={openAddForm}>
            <Plus size={18} />
            {t("addPerson")}
          </button>
        )}
      </div>

      {sortedPersons.length === 0 && (
        <p className="no-results">{t("noImportantPersonsFound")}</p>
      )}

      <div className="admin-details-list">
        {sortedPersons.map((person) => (
          <div className="admin-details-card" key={person.id}>
            <div className="admin-details-photo">
              {person.photo ? (
                <img src={person.photo} alt={person.name} />
              ) : (
                <User size={30} />
              )}
            </div>

            <h3>{person.name}</h3>
            <span className="admin-role-badge">{person.role}</span>

            {person.description && <p>{person.description}</p>}

            <div className="admin-details-contact">
              {person.phone && (
                <a href={`tel:${person.phone}`}>
                  <Phone size={14} />
                  {person.phone}
                </a>
              )}
              {person.email && (
                <a href={`mailto:${person.email}`}>
                  <Mail size={14} />
                  {person.email}
                </a>
              )}
            </div>

            {person.address && (
              <p className="admin-details-address">{person.address}</p>
            )}

            {isAdmin && (
              <div className="admin-details-actions">
                <button type="button" onClick={() => openEditForm(person)}>
                  <Edit size={16} />
                  {t("edit")}
                </button>
                <button type="button" onClick={() => handleDelete(person)}>
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
              <h2>{editingPerson ? t("editPerson") : t("addPerson")}</h2>
              <button
                type="button"
                className="modal-close-button"
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t("personName")}</label>
                <input
                  type="text"
                  value={formData.name}
                  placeholder={t("enterPersonName")}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("role")}</label>

                {!useCustomRole ? (
                  <select
                    value={formData.role}
                    onChange={(event) => handleRoleSelect(event.target.value)}
                  >
                    <option value="">{t("selectOrTypeRole")}</option>
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                    <option value="__custom__">{t("customRole")}</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.role}
                    placeholder={t("selectOrTypeRole")}
                    onChange={(event) =>
                      setFormData({ ...formData, role: event.target.value })
                    }
                  />
                )}
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
                <label>{t("displayOrder")}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      display_order: Number(event.target.value) || 0,
                    })
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
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  {t("cancel")}
                </button>
                <button type="submit" disabled={saving}>
                  {saving
                    ? t("saving")
                    : editingPerson
                    ? t("updatePerson")
                    : t("addPerson")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportantPersons;
