import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  CalendarDays,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

// Theme-matched, non-black palette for chart series and pie slices —
// warm and distinct so categories are easy to tell apart at a glance.
const CHART_COLORS = [
  "#d9a441", // marigold gold
  "#8c2f39", // kumkum maroon
  "#2e7d52", // success green
  "#3f6b8f", // muted teal-blue
  "#b8742c", // warm amber
  "#6a4c93", // soft plum
  "#c0392b", // warm red
];

function Home() {
  const { t, i18n } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/api/dashboard/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setDashboard(data);
      } catch (err) {
        // AbortError fires when the component unmounts mid-request; that's
        // expected and not a real failure, so skip setting error state for it.
        if (err.name !== "AbortError") {
          console.error("Dashboard load failed:", err);
          setError(t("unableToLoadDashboard"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const retry = () => {
    // Re-trigger the effect by toggling nothing external is simplest here:
    // just call the same fetch logic again directly.
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/dashboard/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setDashboard(data))
      .catch((err) => {
        console.error("Dashboard retry failed:", err);
        setError(t("unableToLoadDashboard"));
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="dashboard-loader"></div>
        <p>{t("loadingDashboard")}</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="dashboard-state">
        <p>{error || t("unableToLoadDashboard")}</p>
        <button onClick={retry}>{t("retry")}</button>
      </div>
    );
  }

  // Guard every numeric field against missing/non-numeric API values so a
  // partial or malformed response never crashes the dashboard.
  const safeNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const collection = safeNumber(dashboard.total_collection);
  const expenses = safeNumber(dashboard.total_expenses);
  const balance = safeNumber(dashboard.balance);

  const localeForDates = i18n.language === "ta" ? "ta-IN" : "en-IN";

  const monthlyData = (dashboard.monthly_data || []).map((item) => {
    const parsedDate = new Date(`${item.month}-01`);
    const monthLabel = Number.isNaN(parsedDate.getTime())
      ? item.month
      : parsedDate.toLocaleDateString(localeForDates, {
          month: "short",
          year: "numeric",
        });

    return {
      ...item,
      collection: safeNumber(item.collection),
      expenses: safeNumber(item.expenses),
      monthLabel,
    };
  });

  const categoryData = (dashboard.expense_categories || []).map((item) => ({
    ...item,
    total: safeNumber(item.total),
    label: (item.category || "").replace(/_/g, " "),
  }));

  const formatAmount = (amount) =>
    safeNumber(amount).toLocaleString(localeForDates, {
      maximumFractionDigits: 2,
    });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{t("dashboard")}</h1>
          <p>{t("dashboardSubtitle")}</p>
        </div>

        <div className="dashboard-date">
          <CalendarDays size={18} />
          <span>
            {new Date().toLocaleDateString(localeForDates, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>{t("totalFamilies")}</span>
            <h2>{dashboard.total_families ?? 0}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>{t("totalFestivals")}</span>
            <h2>{dashboard.total_festivals ?? 0}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>{t("totalCollection")}</span>
            <h2>₹{formatAmount(collection)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingDown size={22} />
          </div>

          <div>
            <span>{t("totalExpenses")}</span>
            <h2>₹{formatAmount(expenses)}</h2>
          </div>
        </div>

        <div
          className={`stat-card ${
            balance < 0 ? "balance-negative" : "balance-positive"
          }`}
        >
          <div className="stat-icon">
            <Wallet size={22} />
          </div>

          <div>
            <span>{t("currentBalance")}</span>
            <h2>
              {balance < 0 ? "-₹" : "₹"}
              {formatAmount(Math.abs(balance))}
            </h2>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card chart-wide">
          <div className="chart-header">
            <div>
              <h3>{t("collectionVsExpenses")}</h3>
              <p>{t("monthlyFinancialComparison")}</p>
            </div>
          </div>

          <div className="chart-box">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="monthLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    width={48}
                  />

                  <Tooltip formatter={(value) => `₹${formatAmount(value)}`} />

                  <Legend wrapperStyle={{ fontSize: 12 }} />

                  <Bar
                    dataKey="collection"
                    name={t("collection")}
                    radius={[6, 6, 0, 0]}
                    fill={CHART_COLORS[0]}
                  />

                  <Bar
                    dataKey="expenses"
                    name={t("totalExpenses")}
                    radius={[6, 6, 0, 0]}
                    fill={CHART_COLORS[1]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">{t("noFinancialData")}</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>{t("expenseCategories")}</h3>
              <p>{t("expenseDistribution")}</p>
            </div>
          </div>

          <div className="chart-box">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    label={{ fontSize: 11 }}
                  >
                    {categoryData.map((item, index) => (
                      <Cell
                        key={item.category || index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => `₹${formatAmount(value)}`} />

                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">{t("noExpenseData")}</div>
            )}
          </div>
        </div>

        <div className="chart-card chart-full">
          <div className="chart-header">
            <div>
              <h3>{t("monthlyFinancialTrend")}</h3>
              <p>{t("collectionExpensesOverTime")}</p>
            </div>
          </div>

          <div className="chart-box">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="monthLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    width={48}
                  />

                  <Tooltip formatter={(value) => `₹${formatAmount(value)}`} />

                  <Legend wrapperStyle={{ fontSize: 12 }} />

                  <Line
                    type="monotone"
                    dataKey="collection"
                    name={t("collection")}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    stroke={CHART_COLORS[0]}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name={t("totalExpenses")}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    stroke={CHART_COLORS[1]}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">{t("noMonthlyData")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
