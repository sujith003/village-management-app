import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Receipt,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/useToast";

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

const EMPTY_FORM = {
  festival: "",
  expense_title: "",
  category: "",
  amount: "",
  advance_amount: "",
  expense_date: "",
  description: "",
};

const CATEGORY_VALUES = [
  { value: "MELAM", labelKey: "categoryMelam" },
  { value: "CRACKERS", labelKey: "categoryCrackers" },
  { value: "DECORATION", labelKey: "categoryDecoration" },
  { value: "SOUND", labelKey: "categorySound" },
  { value: "THER", labelKey: "categoryTher" },
  { value: "FOOD", labelKey: "categoryFood" },
  { value: "OTHER", labelKey: "categoryOther" },
];

function Expenses() {
  const { t } = useTranslation();
  const toast = useToast();
  const CATEGORIES = CATEGORY_VALUES.map((item) => ({
    value: item.value,
    label: t(item.labelKey),
  }));

  const [expenses, setExpenses] = useState([]);
  const [festivals, setFestivals] = useState([]);

  const [search, setSearch] = useState("");
  const [festivalFilter, setFestivalFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  // =====================================================
  // FETCH EXPENSES
  // =====================================================

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/expenses/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();

      setExpenses(
        Array.isArray(data)
          ? data
          : data.results || data.expenses || []
      );
    } catch (err) {
      console.error("Expense fetch error:", err);
      setError(t("unableToLoadExpenses"));
    }
  };

  // =====================================================
  // FETCH FESTIVALS
  // =====================================================

  const fetchFestivals = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/festivals/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch festivals");
      }

      const data = await response.json();

      setFestivals(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      console.error("Festival fetch error:", err);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchExpenses(),
        fetchFestivals(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =====================================================
  // FILTER EXPENSES
  // =====================================================

  const filteredExpenses = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !searchText ||
        expense.expense_title
          ?.toLowerCase()
          .includes(searchText) ||
        expense.festival_name
          ?.toLowerCase()
          .includes(searchText) ||
        expense.category_display
          ?.toLowerCase()
          .includes(searchText) ||
        expense.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesFestival =
        festivalFilter === "ALL" ||
        String(expense.festival) ===
          String(festivalFilter);

      const matchesCategory =
        categoryFilter === "ALL" ||
        expense.category === categoryFilter;

      return (
        matchesSearch &&
        matchesFestival &&
        matchesCategory
      );
    });
  }, [
    expenses,
    search,
    festivalFilter,
    categoryFilter,
  ]);

  // =====================================================
  // TOTALS
  // =====================================================

  const totals = useMemo(() => {
    return filteredExpenses.reduce(
      (result, expense) => {
        const amount =
          Number(expense.amount) || 0;

        const advance =
          Number(expense.advance_amount) || 0;

        const balance =
          Number(
            expense.balance_amount
          ) || amount - advance;

        result.total += amount;
        result.advance += advance;
        result.balance += balance;

        return result;
      },
      {
        total: 0,
        advance: 0,
        balance: 0,
      }
    );
  }, [filteredExpenses]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD
  // =====================================================

  const handleAdd = () => {
    setEditingExpense(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (expense) => {
    setEditingExpense(expense);

    setForm({
      festival: expense.festival || "",
      expense_title:
        expense.expense_title || "",
      category: expense.category || "",
      amount: expense.amount || "",
      advance_amount:
        expense.advance_amount || "0",
      expense_date:
        expense.expense_date || "",
      description:
        expense.description || "",
    });

    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const handleClose = () => {
    if (saving) return;

    setShowForm(false);
    setEditingExpense(null);
    setForm(EMPTY_FORM);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.festival) {
      toast.error(t("pleaseSelectFestival"));
      return;
    }

    if (!form.expense_title.trim()) {
      toast.error(t("pleaseEnterExpenseTitle"));
      return;
    }

    if (!form.category) {
      toast.error(t("pleaseSelectCategory"));
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error(t("pleaseEnterValidAmount"));
      return;
    }

    if (
      Number(form.advance_amount || 0) >
      Number(form.amount)
    ) {
      toast.error(t("advanceExceedsTotal"));
      return;
    }

    if (!form.expense_date) {
      toast.error(t("pleaseSelectExpenseDate"));
      return;
    }

    try {
      setSaving(true);

      const url = editingExpense
        ? `${API_URL}/api/expenses/${editingExpense.id}/`
        : `${API_URL}/api/expenses/`;

      const method = editingExpense
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          festival: Number(form.festival),
          expense_title:
            form.expense_title.trim(),
          category: form.category,
          amount: form.amount,
          advance_amount:
            form.advance_amount || "0",
          expense_date: form.expense_date,
          description:
            form.description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        console.error(
          "Save expense error:",
          errorData
        );

        throw new Error("Save failed");
      }

      await fetchExpenses();

      handleClose();

      toast.success(
        editingExpense
          ? t("expenseUpdatedSuccess")
          : t("expenseAddedSuccess")
      );
    } catch (err) {
      console.error(err);
      toast.error(t("unableToSaveExpense"));
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      t("confirmDeleteExpense", { title: expense.expense_title })
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/expenses/${expense.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await fetchExpenses();

      toast.success(t("expenseDeletedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("unableToDeleteExpense"));
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return t("notAvailableShort");

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <p>{t("loadingExpenses")}</p>;
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button
          onClick={() => {
            setError("");
            fetchExpenses();
          }}
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>{t("expenses")}</h1>

          <p>{t("manageExpenses")}</p>
        </div>

        {isAdmin && (
          <button
            className="login-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            {t("addExpense")}
          </button>
        )}
      </div>

      {/* SUMMARY */}

      <div className="expense-summary">
        <div className="expense-summary-card">
          <span>{t("totalExpense")}</span>

          <strong>
            ₹{totals.total.toFixed(2)}
          </strong>
        </div>

        <div className="expense-summary-card">
          <span>{t("advanceAmount")}</span>

          <strong>
            ₹{totals.advance.toFixed(2)}
          </strong>
        </div>

        <div className="expense-summary-card">
          <span>{t("balanceAmount")}</span>

          <strong>
            ₹{totals.balance.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* SEARCH */}

      <div className="search-box">
        <Search size={20} />

        <input
          type="text"
          placeholder={t("searchExpensesPlaceholder")}
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* FILTERS */}

      <div className="expense-filters">
        <select
          value={festivalFilter}
          onChange={(event) =>
            setFestivalFilter(event.target.value)
          }
        >
          <option value="ALL">{t("allFestivals")}</option>

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

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
        >
          <option value="ALL">{t("allCategories")}</option>

          {CATEGORIES.map((category) => (
            <option
              key={category.value}
              value={category.value}
            >
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* EXPENSE LIST */}

      {filteredExpenses.length === 0 ? (
        <div className="no-results">
          <Receipt size={32} />

          <p>{t("noExpensesFound")}</p>
        </div>
      ) : (
        <div className="expense-list">
          {filteredExpenses.map((expense) => {
            const amount =
              Number(expense.amount) || 0;

            const advance =
              Number(
                expense.advance_amount
              ) || 0;

            const balance =
              Number(
                expense.balance_amount
              ) || amount - advance;

            return (
              <div
                className="expense-card"
                key={expense.id}
              >
                <div className="expense-card-header">
                  <div>
                    <h2>
                      {expense.expense_title}
                    </h2>

                    <p>
                      {expense.festival_name}
                    </p>
                  </div>

                  <span className="expense-category">
                    {expense.category_display ||
                      expense.category}
                  </span>
                </div>

                <div className="expense-details">
                  <div>
                    <span>{t("total")}</span>

                    <strong>
                      ₹{amount.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>{t("advance")}</span>

                    <strong>
                      ₹{advance.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>{t("balanceLabel")}</span>

                    <strong>
                      ₹{balance.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <p>
                  <strong>{t("date")}:</strong>{" "}
                  {formatDate(
                    expense.expense_date
                  )}
                </p>

                <p>
                  <strong>{t("description")}:</strong>{" "}
                  {expense.description ||
                    t("noDescription")}
                </p>

                {/* ADMIN ACTIONS */}

                {isAdmin && (
                  <div className="expense-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(expense)
                      }
                    >
                      <Edit size={16} />
                      {t("edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(expense)
                      }
                    >
                      <Trash2 size={16} />
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div
          className="payment-modal-overlay"
          onClick={handleClose}
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
                  {editingExpense
                    ? t("editExpense")
                    : t("addExpense")}
                </h2>

                <p>{t("enterExpenseDetails")}</p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={handleClose}
                disabled={saving}
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="expense-form"
            >
              {/* FESTIVAL */}

              <div className="form-group">
                <label>{t("festival")}</label>

                <select
                  name="festival"
                  value={form.festival}
                  onChange={handleChange}
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
                <label>{t("expenseTitle")}</label>

                <input
                  type="text"
                  name="expense_title"
                  value={
                    form.expense_title
                  }
                  onChange={handleChange}
                  placeholder={t("exampleMelam")}
                />
              </div>

              {/* CATEGORY */}

              <div className="form-group">
                <label>{t("category")}</label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">{t("selectCategory")}</option>

                  {CATEGORIES.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* TOTAL AMOUNT */}

              <div className="form-group">
                <label>{t("totalAmount")}</label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder={t("enterTotalAmount")}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* ADVANCE AMOUNT */}

              <div className="form-group">
                <label>{t("advanceAmount")}</label>

                <input
                  type="number"
                  name="advance_amount"
                  value={
                    form.advance_amount
                  }
                  onChange={handleChange}
                  placeholder={t("enterAdvanceAmount")}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* DATE */}

              <div className="form-group">
                <label>{t("expenseDate")}</label>

                <input
                  type="date"
                  name="expense_date"
                  value={
                    form.expense_date
                  }
                  onChange={handleChange}
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>{t("description")}</label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  placeholder={t("enterDescription")}
                  rows="4"
                />
              </div>

              {/* BUTTONS */}

              <div className="expense-form-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={saving}
                >
                  {saving
                    ? t("saving")
                    : editingExpense
                    ? t("updateExpense")
                    : t("addExpense")}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;