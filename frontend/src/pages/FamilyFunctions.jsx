import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PartyPopper,
  Plus,
  X,
  Check,
  Trash2,
  Power,
  Clock,
  MapPin,
  Utensils,
  User,
} from "lucide-react";
import { useToast } from "../components/useToast";
import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

const FUNCTION_TYPE_KEYS = [
  "functionTypeWedding",
  "functionTypeHouseWarming",
  "functionTypeBirthday",
  "functionTypePuberty",
  "functionTypeNaming",
  "functionTypeEngagement",
  "functionTypeOther",
];

const FUNCTION_TYPE_VALUES = [
  "WEDDING",
  "HOUSE_WARMING",
  "BIRTHDAY",
  "PUBERTY",
  "NAMING",
  "ENGAGEMENT",
  "OTHER",
];

const EMPTY_FORM = {
  host_name: "",
  host_address: "",
  host_mobile: "",
  function_type: "WEDDING",
  title: "",
  description: "",
  function_date: "",
  start_time: "",
  end_time: "",
  food_details: "",
  location: "",
  additional_details: "",
  invitation_image: null,
};

function FamilyFunctions() {
  const { t } = useTranslation();
  const toast = useToast();

  const isAdmin = localStorage.getItem("userType") === "admin";
  const isPublicUser = localStorage.getItem("userType") === "public";
  const isLoggedIn = isAdmin || isPublicUser;
  const myPhone = localStorage.getItem("publicPhone") || "";

  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showMine, setShowMine] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFunction, setSelectedFunction] = useState(null);

  const FUNCTION_TYPE_LABELS = FUNCTION_TYPE_VALUES.reduce(
    (map, value, index) => {
      map[value] = t(FUNCTION_TYPE_KEYS[index]);
      return map;
    },
    {}
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchFunctions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/family-functions/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch (${response.status})`);
        }

        const data = await response.json();
        setFunctions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Family functions error:", err);
          setError(t("unableToLoadFamilyFunctions"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFunctions();

    return () => controller.abort();
  }, [t]);

  const refetch = async () => {
    try {
      const response = await fetch(`${API_URL}/api/family-functions/`);
      if (!response.ok) throw new Error("refetch failed");
      const data = await response.json();
      setFunctions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddForm = () => {
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.host_name.trim() ||
      !formData.host_address.trim() ||
      !formData.host_mobile.trim() ||
      !formData.title.trim() ||
      !formData.function_date ||
      !formData.start_time ||
      !formData.end_time ||
      !formData.location.trim()
    ) {
      toast.error(t("pleaseFillRequiredFunctionFields"));
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "invitation_image") {
          if (value) payload.append("invitation_image", value);
          return;
        }
        payload.append(key, value ?? "");
      });

      const response = await fetch(`${API_URL}/api/family-functions/`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Save failed (${response.status})`);
      }

      await refetch();
      closeForm();
      toast.success(t("functionSubmittedForApproval"));
    } catch (err) {
      console.error("Family function save error:", err);
      toast.error(t("unableToSaveFunction"));
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (fn) => {
    try {
      const response = await fetch(
        `${API_URL}/api/family-functions/${fn.id}/approve/`,
        { method: "PATCH" }
      );
      if (!response.ok) throw new Error("approve failed");
      await refetch();
      toast.success(t("functionApprovedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("unableToApproveFunction"));
    }
  };

  const handleReject = async (fn) => {
    const confirmed = window.confirm(
      t("confirmRejectFunction", { title: fn.title })
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/family-functions/${fn.id}/reject/`,
        { method: "PATCH" }
      );
      if (!response.ok) throw new Error("reject failed");
      await refetch();
      toast.success(t("functionRejectedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("unableToRejectFunction"));
    }
  };

  const handleToggleActive = async (fn) => {
    try {
      const response = await fetch(
        `${API_URL}/api/family-functions/${fn.id}/toggle-active/`,
        { method: "PATCH" }
      );
      if (!response.ok) throw new Error("toggle failed");
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error(t("unableToUpdateFunction"));
    }
  };

  const handleDelete = async (fn) => {
    const confirmed = window.confirm(
      t("confirmDeleteFunction", { title: fn.title })
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/family-functions/${fn.id}/`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("delete failed");
      setFunctions((previous) => previous.filter((f) => f.id !== fn.id));
      toast.success(t("functionDeletedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("unableToDeleteFunction"));
    }
  };

  if (loading) {
    return <p>{t("loadingFamilyFunctions")}</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  const approvedActive = functions.filter(
    (fn) => fn.status === "APPROVED" && fn.is_active
  );
  const approvedInactive = functions.filter(
    (fn) => fn.status === "APPROVED" && !fn.is_active
  );
  const pending = functions.filter((fn) => fn.status === "PENDING");
  const mine = functions.filter(
    (fn) => myPhone && fn.host_mobile === myPhone
  );

  const statusLabel = (fn) => {
    if (fn.status === "PENDING") return t("statusPending");
    if (fn.status === "REJECTED") return t("statusRejected");
    return fn.is_active ? t("active") : t("inactive");
  };

  const FunctionCard = ({ fn, showAdminActions }) => (
    <div className="function-card">
      <div className="function-card-image">
        {fn.invitation_image ? (
          <img src={fn.invitation_image} alt={fn.title} />
        ) : (
          <PartyPopper size={32} />
        )}
      </div>

      <div className="function-card-body">
        <span className="function-type-badge">
          {FUNCTION_TYPE_LABELS[fn.function_type] || fn.function_type}
        </span>

        <h3>{fn.title}</h3>

        <p className="function-host">
          <User size={14} /> {fn.host_name}
        </p>

        <p className="function-meta">
          <Clock size={14} /> {fn.function_date} · {fn.start_time}–
          {fn.end_time}
        </p>

        <p className="function-meta">
          <MapPin size={14} /> {fn.location}
        </p>

        {fn.food_details && (
          <p className="function-meta">
            <Utensils size={14} /> {fn.food_details}
          </p>
        )}

        <div className="function-card-footer">
          <span
            className={
              fn.status === "PENDING"
                ? "pending-badge"
                : fn.status === "REJECTED"
                ? "status-pill status-no"
                : fn.is_active
                ? "status-pill status-yes"
                : "status-pill"
            }
          >
            {statusLabel(fn)}
          </span>

          <button type="button" onClick={() => setSelectedFunction(fn)}>
            {t("viewDetails")}
          </button>
        </div>

        {showAdminActions && (
          <div className="function-admin-actions">
            {fn.status === "PENDING" && (
              <>
                <button
                  type="button"
                  className="approve-button"
                  onClick={() => handleApprove(fn)}
                >
                  <Check size={16} />
                  {t("approve")}
                </button>
                <button
                  type="button"
                  className="reject-button"
                  onClick={() => handleReject(fn)}
                >
                  <X size={16} />
                  {t("reject")}
                </button>
              </>
            )}

            {fn.status === "APPROVED" && (
              <button type="button" onClick={() => handleToggleActive(fn)}>
                <Power size={16} />
                {fn.is_active ? t("markInactive") : t("markActive")}
              </button>
            )}

            <button type="button" onClick={() => handleDelete(fn)}>
              <Trash2 size={16} />
              {t("delete")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="family-functions-page">
      <div className="page-header">
        <div>
          <h1>{t("familyFunctions")}</h1>
          <p>{t("familyFunctionsSubtitle")}</p>
        </div>

        <div className="family-functions-header-actions">
          {isLoggedIn && mine.length > 0 && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowMine((value) => !value)}
            >
              {showMine ? t("viewAllFunctions") : t("viewMySubmissions")}
            </button>
          )}

          {isLoggedIn && (
            <button type="button" className="login-button" onClick={openAddForm}>
              <Plus size={18} />
              {t("addFamilyFunction")}
            </button>
          )}
        </div>
      </div>

      {isAdmin && pending.length > 0 && (
        <section className="function-section">
          <h2>{t("pendingApprovalTitle", { count: pending.length })}</h2>
          <div className="function-grid">
            {pending.map((fn) => (
              <FunctionCard key={fn.id} fn={fn} showAdminActions />
            ))}
          </div>
        </section>
      )}

      {showMine ? (
        <section className="function-section">
          <h2>{t("mySubmissions")}</h2>
          {mine.length === 0 ? (
            <p className="no-results">{t("noSubmissionsYet")}</p>
          ) : (
            <div className="function-grid">
              {mine.map((fn) => (
                <FunctionCard key={fn.id} fn={fn} showAdminActions={false} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="function-section">
          {approvedActive.length === 0 && approvedInactive.length === 0 ? (
            <p className="no-results">{t("noFamilyFunctionsFound")}</p>
          ) : (
            <div className="function-grid">
              {[...approvedActive, ...approvedInactive].map((fn) => (
                <FunctionCard key={fn.id} fn={fn} showAdminActions={isAdmin} />
              ))}
            </div>
          )}
        </section>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("addFamilyFunction")}</h2>
              <button
                type="button"
                className="modal-close-button"
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <h3 className="form-section-title">{t("hostDetails")}</h3>

              <div className="form-group">
                <label>{t("hostName")}</label>
                <input
                  type="text"
                  value={formData.host_name}
                  onChange={(e) =>
                    setFormData({ ...formData, host_name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("hostAddress")}</label>
                <input
                  type="text"
                  value={formData.host_address}
                  onChange={(e) =>
                    setFormData({ ...formData, host_address: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("phoneNumber")}</label>
                <input
                  type="tel"
                  value={formData.host_mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, host_mobile: e.target.value })
                  }
                />
              </div>

              <h3 className="form-section-title">{t("functionDetails")}</h3>

              <div className="form-group">
                <label>{t("functionType")}</label>
                <select
                  value={formData.function_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      function_type: e.target.value,
                    })
                  }
                >
                  {FUNCTION_TYPE_VALUES.map((value, index) => (
                    <option key={value} value={value}>
                      {t(FUNCTION_TYPE_KEYS[index])}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("functionTitle")}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("description")}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("functionDate")}</label>
                <input
                  type="date"
                  value={formData.function_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      function_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("startTime")}</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("endTime")}</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("foodDetails")}</label>
                <input
                  type="text"
                  value={formData.food_details}
                  onChange={(e) =>
                    setFormData({ ...formData, food_details: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("functionLocation")}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("additionalDetails")}</label>
                <textarea
                  value={formData.additional_details}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additional_details: e.target.value,
                    })
                  }
                />
              </div>

              <h3 className="form-section-title">{t("invitation")}</h3>

              <div className="form-group">
                <label>{t("uploadInvitationImage")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invitation_image: e.target.files?.[0] || null,
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
                  {saving ? t("saving") : t("submitForApproval")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedFunction && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedFunction(null)}
        >
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedFunction.title}</h2>
              <button
                type="button"
                className="modal-close-button"
                onClick={() => setSelectedFunction(null)}
              >
                <X size={20} />
              </button>
            </div>

            {selectedFunction.invitation_image && (
              <img
                src={selectedFunction.invitation_image}
                alt={selectedFunction.title}
                className="function-detail-image"
              />
            )}

            <p>
              <strong>{t("hostName")}:</strong> {selectedFunction.host_name}
            </p>
            <p>
              <strong>{t("hostAddress")}:</strong>{" "}
              {selectedFunction.host_address}
            </p>
            <p>
              <strong>{t("phoneNumber")}:</strong>{" "}
              {selectedFunction.host_mobile}
            </p>
            <p>
              <strong>{t("functionType")}:</strong>{" "}
              {FUNCTION_TYPE_LABELS[selectedFunction.function_type]}
            </p>
            <p>
              <strong>{t("functionDate")}:</strong>{" "}
              {selectedFunction.function_date} ·{" "}
              {selectedFunction.start_time}–{selectedFunction.end_time}
            </p>
            <p>
              <strong>{t("functionLocation")}:</strong>{" "}
              {selectedFunction.location}
            </p>
            {selectedFunction.food_details && (
              <p>
                <strong>{t("foodDetails")}:</strong>{" "}
                {selectedFunction.food_details}
              </p>
            )}
            {selectedFunction.description && (
              <p>
                <strong>{t("description")}:</strong>{" "}
                {selectedFunction.description}
              </p>
            )}
            {selectedFunction.additional_details && (
              <p>
                <strong>{t("additionalDetails")}:</strong>{" "}
                {selectedFunction.additional_details}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyFunctions;