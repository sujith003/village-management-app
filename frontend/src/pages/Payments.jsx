import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  IndianRupee,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

const EMPTY_FORM = {
  family: "",
  festival: "",
  amount: "",
  payment_date: "",
  payment_method: "CASH",  
  transaction_reference: "",
};

function Payments() {
  const { t } = useTranslation();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [families, setFamilies] = useState([]);
  const [festivals, setFestivals] = useState([]);

  const [search, setSearch] = useState("");
  const [festivalFilter, setFestivalFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [paymentsResponse, familiesResponse, festivalsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/payments/`),
          fetch(`${API_URL}/api/families/`),
          fetch(`${API_URL}/api/festivals/`),
        ]);

      if (
        !paymentsResponse.ok ||
        !familiesResponse.ok ||
        !festivalsResponse.ok
      ) {
        throw new Error("Failed to fetch payment data");
      }

      const paymentsData = await paymentsResponse.json();
      const familiesData = await familiesResponse.json();
      const festivalsData = await festivalsResponse.json();

      setPayments(paymentsData);
      setFamilies(familiesData);
      setFestivals(festivalsData);
    } catch (err) {
      console.error(err);
      setError(t("unableToLoadPayments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const getFamilyName = (familyId) => {
    const family = families.find(
      (item) => String(item.id) === String(familyId)
    );

    return family?.family_name || `Family #${familyId}`;
  };

  const getFestivalName = (festivalId) => {
    const festival = festivals.find(
      (item) => String(item.id) === String(festivalId)
    );

    if (!festival) {
      return `Festival #${festivalId}`;
    }

    return `${festival.festival_name} ${festival.year}`;
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

  // =====================================================
  // SEARCH + FESTIVAL FILTER
  // =====================================================

  const filteredPayments = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return payments.filter((payment) => {
      const familyName = getFamilyName(payment.family).toLowerCase();
      const festivalName = getFestivalName(payment.festival).toLowerCase();

      const matchesSearch =
        familyName.includes(searchText) ||
        festivalName.includes(searchText) ||
        String(payment.amount || "").includes(searchText);

      const matchesFestival =
        !festivalFilter ||
        String(payment.festival) === String(festivalFilter);

      return matchesSearch && matchesFestival;
    });
  }, [payments, families, festivals, search, festivalFilter]);

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingPayment(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (payment) => {
    setEditingPayment(payment);

    setFormData({
      family: payment.family || "",
      festival: payment.festival || "",
      amount: payment.amount || "",
      payment_date: payment.payment_date || "",
      payment_method: payment.payment_method || "CASH",
      transaction_reference: payment.transaction_reference || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingPayment(null);
    setFormData(EMPTY_FORM);
  };

  // =====================================================
  // ADD / UPDATE PAYMENT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.family ||
      !formData.festival ||
      !formData.amount ||
      !formData.payment_date
    ) {
      toast.error(t("pleaseFillAllFields"));
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingPayment);

      const url = isEditing
        ? `${API_URL}/api/payments/${editingPayment.id}/`
        : `${API_URL}/api/payments/`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          family: Number(formData.family),
          festival: Number(formData.festival),
          amount: formData.amount,
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          transaction_reference: formData.transaction_reference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("Payment save error:", errorData);

        throw new Error("Failed to save payment");
      }

      toast.success(
        isEditing
          ? t("paymentUpdatedSuccess")
          : t("paymentAddedSuccess")
      );

      closeForm();
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("unableToSavePayment"));
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  const handleDelete = async (payment) => {
    const familyName = getFamilyName(payment.family);
    const festivalName = getFestivalName(payment.festival);

    const confirmed = window.confirm(
      t("confirmDeletePayment", {
        amount: payment.amount,
        family: familyName,
        festival: festivalName,
      })
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/payments/${payment.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      toast.success(t("paymentDeletedSuccess"));

      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("unableToDeletePayment"));
    }
  };

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  if (loading) {
    return <p>{t("loadingPayments")}</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>{t("payments")}</h1>
          <p>{t("viewManagePayments")}</p>
        </div>

        {isAdmin && (
          <button
            className="login-button"
            onClick={openAddForm}
          >
            <Plus size={18} />
            {t("addPayment")}
          </button>
        )}
      </div>

      {/* FILTER SECTION */}

      <div className="search-box">
        <Search size={20} />

        <input
          type="text"
          placeholder={t("searchPaymentsPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

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
              {festival.festival_name} {festival.year}
            </option>
          ))}
        </select>
      </div>

      {/* PAYMENT LIST */}

      {filteredPayments.length === 0 ? (
        <div className="no-results">
          <IndianRupee size={32} />
          <p>{t("noPaymentsFound")}</p>
        </div>
      ) : (
        <div className="payment-list">
          {filteredPayments.map((payment) => (
            <div
              className="payment-card"
              key={payment.id}
            >
              <div className="payment-card-top">
                <div>
                  <h2>
                    {getFamilyName(payment.family)}
                  </h2>

                  <p>
                    {getFestivalName(payment.festival)}
                  </p>
                </div>

                <strong>
                  ₹{payment.amount}
                </strong>
              </div>

              <div className="payment-info-grid">
                <div className="payment-info">
                  <span>{t("paymentDate")}</span>
                  <strong>
                    {formatDate(payment.payment_date)}
                  </strong>
                </div>

                <div className="payment-info">
                  <span>{t("festival")}</span>
                  <strong>
                    {getFestivalName(payment.festival)}
                  </strong>
                </div>

                <div className="payment-info">
                  <span>{t("amountPaid")}</span>
                  <strong>
                    ₹{payment.amount}
                  </strong>
                </div>
              </div>

              {/* ADMIN ACTIONS */}

              {isAdmin && (
                <div className="payment-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(payment)
                    }
                  >
                    <Edit size={16} />
                    {t("edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(payment)
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

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div
          className="payment-modal-overlay"
          onClick={closeForm}
        >
          <div
            className="payment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="payment-modal-header">
              <div>
                <h2>
                  {editingPayment
                    ? t("editPayment")
                    : t("addPayment")}
                </h2>

                <p>{t("enterFamilyPaymentDetails")}</p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeForm}
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="payment-form"
              onSubmit={handleSubmit}
            >
              {/* FAMILY */}

              <div className="form-group">
                <label htmlFor="family">{t("familyName")}</label>

                <select
                  id="family"
                  name="family"
                  value={formData.family}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t("selectFamily")}</option>

                  {families.map((family) => (
                    <option
                      key={family.id}
                      value={family.id}
                    >
                      {family.family_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* FESTIVAL */}

              <div className="form-group">
                <label htmlFor="festival">{t("festival")}</label>

                <select
                  id="festival"
                  name="festival"
                  value={formData.festival}
                  onChange={handleInputChange}
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

              {/* AMOUNT */}

              <div className="form-group">
                <label htmlFor="amount">{t("amount")}</label>

                <input
                  id="amount"
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  placeholder={t("enterAmount")}
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* PAYMENT DATE */}

              <div className="form-group">
                <label htmlFor="payment_date">{t("paymentDate")}</label>

                <input
                  id="payment_date"
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

                {/* PAYMENT METHOD */}
                <div className="form-group">
                  <label htmlFor="payment_method">{t("paymentMethod")}</label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="CASH">{t("paymentMethodCash")}</option>
                    <option value="UPI">{t("paymentMethodUpi")}</option>
                    <option value="BANK_TRANSFER">{t("paymentMethodBankTransfer")}</option>
                  </select>
                </div>

                {/* TRANSACTION REFERENCE */}
                <div className="form-group">
                  <label htmlFor="transaction_reference">{t("transactionReference")}</label>
                  <input
                    id="transaction_reference"
                    type="text"
                    name="transaction_reference"
                    value={formData.transaction_reference}
                    onChange={handleInputChange}
                    placeholder={t("enterTransactionReference")}
                  />
                </div>

              {/* BUTTONS */}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={closeForm}
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
                    : editingPayment
                    ? t("updatePayment")
                    : t("addPayment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;