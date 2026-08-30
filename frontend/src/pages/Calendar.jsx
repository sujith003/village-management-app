import { useEffect, useState } from "react";
import { CalendarDays, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api/festivals/`;

const MONTH_KEYS = [
  "monthJanuary",
  "monthFebruary",
  "monthMarch",
  "monthApril",
  "monthMay",
  "monthJune",
  "monthJuly",
  "monthAugust",
  "monthSeptember",
  "monthOctober",
  "monthNovember",
  "monthDecember",
];

const DAY_KEYS = [
  "dayShortSun",
  "dayShortMon",
  "dayShortTue",
  "dayShortWed",
  "dayShortThu",
  "dayShortFri",
  "dayShortSat",
];

function Calendar() {
  const { t, i18n } = useTranslation();
  const [festivals, setFestivals] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const userType = localStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const localeForDates = i18n.language === "ta" ? "ta-IN" : "en-IN";
  const MONTHS = MONTH_KEYS.map((key) => t(key));
  const DAYS = DAY_KEYS.map((key) => t(key));
  const today = new Date();

  // =========================================
  // FETCH FESTIVALS
  // =========================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchFestivals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch festivals (${response.status})`);
        }

        const data = await response.json();

        setFestivals(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Calendar error:", err);
          setError(t("unableToLoadCalendar"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFestivals();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // =========================================
  // FILTER FESTIVALS
  // =========================================

  const filteredFestivals = festivals.filter((festival) => {
    const festivalYear = Number(festival.year);
    const festivalName = festival.festival_name?.toLowerCase() || "";
    const searchText = search.toLowerCase().trim();

    return festivalYear === selectedYear && festivalName.includes(searchText);
  });

  // =========================================
  // GET FESTIVALS FOR SPECIFIC DATE
  // =========================================

  const getFestivalsForDate = (year, month, day) => {
    return filteredFestivals.filter((festival) => {
      if (!festival.festival_date) {
        return false;
      }

      const date = new Date(festival.festival_date);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      );
    });
  };

  // =========================================
  // GENERATE MONTH DAYS
  // =========================================

  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="calendar-status">
        <CalendarDays size={28} />
        <p>{t("loadingCalendar")}</p>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="calendar-status">
        <CalendarDays size={28} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">
        <div>
          <h1>{t("festivalCalendar")}</h1>

          <p>{t("viewAllFestivalDates")}</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="login-button"
            onClick={() => navigate("/festivals")}
          >
            <Settings size={18} />
            {t("manageFestivals")}
          </button>
        )}
      </div>

      {/* =====================================
          SEARCH + YEAR FILTER
      ===================================== */}

      <div className="calendar-controls">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder={t("searchFestivalPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={selectedYear}
          onChange={(event) => setSelectedYear(Number(event.target.value))}
        >
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
          <option value={2028}>2028</option>
          <option value={2029}>2029</option>
        </select>
      </div>

      {/* =====================================
          CALENDAR TITLE
      ===================================== */}

      <div className="calendar-title">
        <CalendarDays size={24} />

        <h2>
          {selectedYear} {t("festivalCalendar")}
        </h2>
      </div>

      {/* =====================================
          YEAR CALENDAR
      ===================================== */}

      <div className="year-calendar">
        {MONTHS.map((month, monthIndex) => {
          const calendarDays = generateCalendarDays(selectedYear, monthIndex);

          return (
            <div className="monthly-calendar" key={MONTH_KEYS[monthIndex]}>
              <h3>
                {month} {selectedYear}
              </h3>

              {/* WEEK HEADER */}

              <div className="week-header">
                {DAYS.map((day, dayIndex) => (
                  <div key={DAY_KEYS[dayIndex]}>{day}</div>
                ))}
              </div>

              {/* DAYS */}

              <div className="calendar-days">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        className="calendar-empty"
                        key={`empty-${index}`}
                      />
                    );
                  }

                  const dayFestivals = getFestivalsForDate(
                    selectedYear,
                    monthIndex,
                    day
                  );

                  const currentDate = new Date(
                    selectedYear,
                    monthIndex,
                    day
                  );

                  const dayName = currentDate.toLocaleDateString(
                    localeForDates,
                    { weekday: "long" }
                  );

                  const isToday =
                    currentDate.toDateString() === today.toDateString();

                  // Cap visible names so a busy day never grows the cell
                  // and breaks row alignment; the full list is still
                  // reachable via the tooltip and the summary list below.
                  const visibleFestivals = dayFestivals.slice(0, 2);
                  const extraCount = dayFestivals.length - visibleFestivals.length;

                  const dayClasses = ["calendar-day"];
                  if (dayFestivals.length > 0) {
                    dayClasses.push("festival-day");
                  }
                  if (isToday) {
                    dayClasses.push("is-today");
                  }

                  const cellTitle =
                    dayFestivals.length > 0
                      ? `${dayName} — ${dayFestivals
                          .map((festival) => festival.festival_name)
                          .join(", ")}`
                      : dayName;

                  return (
                    <div
                      className={dayClasses.join(" ")}
                      key={day}
                      title={cellTitle}
                    >
                      <span className="date-number">{day}</span>

                      {visibleFestivals.map((festival) => (
                        <span className="festival-name" key={festival.id}>
                          {festival.festival_name}
                        </span>
                      ))}

                      {extraCount > 0 && (
                        <span className="festival-name-more">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================
          FESTIVAL SUMMARY
      ===================================== */}

      {filteredFestivals.length > 0 && (
        <div className="festival-summary">
          <div className="festival-summary-header">
            <div>
              <h2>{t("festivalDatesTitle")}</h2>

              <p>
                {t("festivalsFound", { count: filteredFestivals.length })}
              </p>
            </div>

            <CalendarDays size={24} />
          </div>

          {filteredFestivals
            .filter((festival) => festival.festival_date)
            .sort(
              (a, b) =>
                new Date(a.festival_date) - new Date(b.festival_date)
            )
            .map((festival) => {
              const date = new Date(festival.festival_date);

              if (Number.isNaN(date.getTime())) {
                return null;
              }

              return (
                <div className="festival-summary-item" key={festival.id}>
                  <div className="summary-date">
                    <strong>{date.getDate()}</strong>

                    <span>
                      {date.toLocaleDateString(localeForDates, {
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="summary-details">
                    <strong>{festival.festival_name}</strong>

                    <span>
                      {date.toLocaleDateString(localeForDates, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* =====================================
          NO RESULTS
      ===================================== */}

      {filteredFestivals.length === 0 && (
        <div className="calendar-no-results">
          <CalendarDays size={32} />

          <h3>{t("noFestivalsFoundTitle")}</h3>

          <p>
            {t("noFestivalsAvailableFor", { year: selectedYear })}
            {search && t("matchingSearch", { search })}.
          </p>
        </div>
      )}
    </div>
  );
}

export default Calendar;
