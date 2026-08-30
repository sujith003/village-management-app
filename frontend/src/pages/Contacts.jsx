import { useEffect, useState } from "react";
import {
  Search,
  Phone,
  Users,
  UserRound,
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
  category: "OTHER",
  contact_name: "",
  phone: "",
  alternate_phone: "",
  remarks: "",
};

function Contacts() {
  const { t } = useTranslation();
  const toast = useToast();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const userType = localStorage.getItem("userType");

  const isAdmin = userType === "admin";
  const isPublic = userType === "public";

  const categories = [
    "MELAM",
    "CRACKERS",
    "THER",
    "DECORATION",
    "SOUND",
    "ELECTRICIAN",
    "PRIEST",
    "OTHER",
  ];

  const categoryLabel = (value) => {
    const map = {
      MELAM: t("categoryMelam"),
      CRACKERS: t("categoryCrackers"),
      THER: t("categoryTher"),
      DECORATION: t("categoryDecoration"),
      SOUND: t("categorySound"),
      ELECTRICIAN: t("categoryElectrician"),
      PRIEST: t("categoryPriest"),
      OTHER: t("categoryOther"),
    };

    return map[value] || value;
  };

  // ==============================
  // FETCH CONTACTS
  // ==============================

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/contacts/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();

      setContacts(data);
    } catch (err) {
      console.error(err);
      setError(t("unableToLoadContacts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ==============================
  // SEARCH + FILTER
  // ==============================

  const filteredContacts = contacts.filter((contact) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      contact.contact_name
        ?.toLowerCase()
        .includes(searchText) ||
      contact.phone
        ?.toLowerCase()
        .includes(searchText) ||
      contact.alternate_phone
        ?.toLowerCase()
        .includes(searchText) ||
      contact.category
        ?.toLowerCase()
        .includes(searchText) ||
      contact.remarks
        ?.toLowerCase()
        .includes(searchText);

    const matchesCategory =
      category === "ALL" ||
      contact.category === category;

    return matchesSearch && matchesCategory;
  });

  // ==============================
  // OPEN ADD MODAL
  // ==============================

  const handleAdd = () => {
    setEditingContact(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  // ==============================
  // OPEN EDIT MODAL
  // ==============================

  const handleEdit = (contact) => {
    setEditingContact(contact);

    setFormData({
      category: contact.category || "OTHER",
      contact_name: contact.contact_name || "",
      phone: contact.phone || "",
      alternate_phone:
        contact.alternate_phone || "",
      remarks: contact.remarks || "",
    });

    setShowModal(true);
  };

  // ==============================
  // FORM CHANGE
  // ==============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================
  // SAVE CONTACT
  // ==============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.contact_name.trim()) {
      toast.error(t("pleaseEnterContactName"));
      return;
    }

    if (!formData.phone.trim()) {
      toast.error(t("pleaseEnterPhoneNumber"));
      return;
    }

    try {
      setSaving(true);

      const url = editingContact
        ? `${API_URL}/api/contacts/${editingContact.id}/`
        : `${API_URL}/api/contacts/`;

      const method = editingContact
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        console.error("API Error:", errorData);

        throw new Error(t("unableToSaveContact"));
      }

      setShowModal(false);
      setEditingContact(null);
      setFormData(EMPTY_FORM);

      await fetchContacts();

      toast.success(
        editingContact
          ? t("contactUpdatedSuccess")
          : t("contactAddedSuccess")
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || t("unableToSaveContact"));
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // DELETE CONTACT
  // ==============================

  const handleDelete = async (contact) => {
    const confirmed = window.confirm(
      t("confirmDeleteContact", { name: contact.contact_name })
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/contacts/${contact.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(t("unableToDeleteContact"));
      }

      setContacts((previous) =>
        previous.filter(
          (item) => item.id !== contact.id
        )
      );

      toast.success(t("contactDeletedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(err.message || t("unableToSaveContact"));
    }
  };

  // ==============================
  // CLOSE MODAL
  // ==============================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingContact(null);
    setFormData(EMPTY_FORM);
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return <p>{t("loadingContacts")}</p>;
  }

  // ==============================
  // ERROR
  // ==============================

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={fetchContacts}>
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ==========================
          PAGE HEADER
      ========================== */}

      <div className="page-header">
        <div>
          <h1>{t("importantContacts")}</h1>
          <p>{t("festivalRelatedContacts")}</p>
        </div>

        {isAdmin && (
          <button
            className="login-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            {t("addContact")}
          </button>
        )}
      </div>

      {/* ==========================
          SEARCH + FILTER
      ========================== */}

      <div className="contact-controls">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder={t("searchContactsPlaceholder")}
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >
          <option value="ALL">{t("allCategories")}</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {categoryLabel(item)}
            </option>
          ))}
        </select>
      </div>

      {/* ==========================
          CONTACT LIST
      ========================== */}

      {filteredContacts.length === 0 ? (
        <div className="no-results">
          <Users size={32} />
          <p>{t("noMatchingContacts")}</p>
        </div>
      ) : (
        <div className="contact-grid">
          {filteredContacts.map((contact) => (
            <div
              className="contact-card"
              key={contact.id}
            >
              {/* Contact Header */}

              <div className="contact-header">
                <div className="contact-icon">
                  <UserRound size={22} />
                </div>

                <div>
                  <h2>{contact.contact_name}</h2>

                  <span>{categoryLabel(contact.category)}</span>
                </div>
              </div>

              {/* Contact Details */}

              <div className="contact-details">
                {(isPublic || isAdmin) && (
                  <>
                    <p>
                      <strong>{t("phone")}:</strong>{" "}
                      {contact.phone}
                    </p>

                    <p>
                      <strong>{t("alternatePhone")}:</strong>{" "}
                      {contact.alternate_phone ||
                        t("notAvailable")}
                    </p>

                    <p>
                      <strong>{t("remarks")}:</strong>{" "}
                      {contact.remarks ||
                        t("noRemarks")}
                    </p>
                  </>
                )}

                {!isPublic && !isAdmin && (
                  <p>
                    <strong>{t("loginToViewContactDetails")}</strong>
                  </p>
                )}
              </div>

              {/* Call Buttons */}

              {(isPublic || isAdmin) && (
                <div className="contact-actions">
                  <a
                    href={`tel:${contact.phone}`}
                    className="call-button"
                  >
                    <Phone size={18} />
                    {t("call")}
                  </a>

                  {contact.alternate_phone && (
                    <a
                      href={`tel:${contact.alternate_phone}`}
                      className="alternate-call-button"
                    >
                      <Phone size={18} />
                      {t("alternate")}
                    </a>
                  )}
                </div>
              )}

              {/* Admin Actions */}

              {isAdmin && (
                <div className="contact-admin-actions">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(contact)
                    }
                  >
                    <Edit size={16} />
                    {t("edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(contact)
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

      {/* ==========================
          ADD / EDIT MODAL
      ========================== */}

      {showModal && (
        <div
          className="contact-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="contact-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}

            <div className="contact-modal-header">
              <div>
                <h2>
                  {editingContact
                    ? t("editContact")
                    : t("addContact")}
                </h2>

                <p>
                  {editingContact
                    ? t("updateContactDetails")
                    : t("addNewImportantContact")}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label>{t("category")}</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {categoryLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("contactName")}</label>

                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  placeholder={t("enterContactName")}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t("phoneNumber")}</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("enterPhoneNumber")}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t("alternatePhone")}</label>

                <input
                  type="tel"
                  name="alternate_phone"
                  value={
                    formData.alternate_phone
                  }
                  onChange={handleChange}
                  placeholder={t("optional")}
                />
              </div>

              <div className="form-group">
                <label>{t("remarks")}</label>

                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder={t("enterRemarks")}
                  rows="3"
                />
              </div>

              {/* Form Actions */}

              <div className="contact-form-actions">
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
                    : editingContact
                    ? t("updateContact")
                    : t("addContact")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;