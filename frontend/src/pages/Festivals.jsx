import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

function Festivals() {
  const { t } = useTranslation();
  const toast = useToast();
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    festival_name: "",
    year: "",
    festival_date: "",
    description: "",
    contribution_amount: "",
    status: "UPCOMING",
  });

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/festivals/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch festivals");
      }

      const data = await response.json();
      setFestivals(data);
    } catch (err) {
      console.error(err);
      setError(t("unableToLoadFestivals"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    setEditingFestival(null);

    setFormData({
      festival_name: "",
      year: "",
      festival_date: "",
      description: "",
      contribution_amount: "",
      status: "UPCOMING",
    });

    setShowModal(true);
  };

  const handleEdit = (festival) => {
    setEditingFestival(festival);

    setFormData({
      festival_name: festival.festival_name || "",
      year: festival.year || "",
      festival_date: festival.festival_date || "",
      description: festival.description || "",
      contribution_amount:
        festival.contribution_amount || "",
      status: festival.status || "UPCOMING",
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
      const url = editingFestival
        ? `${API_URL}/api/festivals/${editingFestival.id}/`
        : `${API_URL}/api/festivals/`;

      const method = editingFestival ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          festival_name: formData.festival_name,
          year: Number(formData.year),
          festival_date: formData.festival_date,
          description: formData.description,
          contribution_amount:
            formData.contribution_amount,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API error:", data);
        throw new Error("Failed to save festival");
      }

      setShowModal(false);
      setEditingFestival(null);

      await fetchFestivals();

      toast.success(
        editingFestival
          ? t("festivalUpdatedSuccess")
          : t("festivalAddedSuccess")
      );
    } catch (err) {
      console.error(err);
      toast.error(t("unableToSaveFestival"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (festival) => {
    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      t("confirmDeleteFestival", { name: festival.festival_name })
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/festivals/${festival.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete festival");
      }

      setFestivals((prev) =>
        prev.filter((item) => item.id !== festival.id)
      );

      toast.success(t("festivalDeletedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("unableToDeleteFestival"));
    }
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingFestival(null);
  };

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

  const getDay = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
    });
  };

  if (loading) {
    return <p>{t("loadingFestivals")}</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("festivals")}</h1>
          <p>{t("viewFestivalDetails")}</p>
        </div>

        {isAdmin && (
          <button
            className="login-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            {t("addFestival")}
          </button>
        )}
      </div>

      {festivals.length === 0 ? (
        <p>{t("noFestivalsFound")}</p>
      ) : (
        <div className="festival-list">
          {festivals.map((festival) => (
            <div
              className="festival-card"
              key={festival.id}
            >
              <h2>{festival.festival_name}</h2>

              <p>
                <strong>{t("year")}:</strong> {festival.year}
              </p>

              <p>
                <strong>{t("festivalDate")}:</strong>{" "}
                {formatDate(festival.festival_date)}
              </p>

              <p>
                <strong>{t("day")}:</strong>{" "}
                {getDay(festival.festival_date)}
              </p>

              <p>
                <strong>{t("description")}:</strong>{" "}
                {festival.description ||
                  t("noDescriptionAvailable")}
              </p>

              <p>
                <strong>{t("contribution")}:</strong>{" "}
                ₹{festival.contribution_amount}
              </p>

              <p>
                <strong>{t("status")}:</strong>{" "}
                {festival.status}
              </p>

              {isAdmin && (
                <div className="festival-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(festival)}
                  >
                    <Edit size={16} />
                    {t("edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(festival)
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
                  {editingFestival
                    ? t("editFestival")
                    : t("addFestival")}
                </h2>

                <p>
                  {editingFestival
                    ? t("updateFestivalDetails")
                    : t("addNewFestival")}
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
                <label>{t("festivalName")}</label>
                <input
                  type="text"
                  name="festival_name"
                  value={formData.festival_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>{t("year")}</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>{t("festivalDate")}</label>
                <input
                  type="date"
                  name="festival_date"
                  value={formData.festival_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>{t("contributionAmount")}</label>
                <input
                  type="number"
                  name="contribution_amount"
                  value={
                    formData.contribution_amount
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label>{t("status")}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="UPCOMING">
                    {t("statusUpcoming")}
                  </option>
                  <option value="ONGOING">
                    {t("statusOngoing")}
                  </option>
                  <option value="COMPLETED">
                    {t("statusCompleted")}
                  </option>
                </select>
              </div>

              <div>
                <label>{t("description")}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
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
                    : editingFestival
                    ? t("updateFestival")
                    : t("addFestival")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Festivals;