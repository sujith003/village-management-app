import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Home as HomeIcon,
  Users,
  CalendarDays,
  IndianRupee,
  Receipt,
  Image,
  Phone,
  Bell,
  LogIn,
  X,
  Check,
  MoreHorizontal,
  PartyPopper,
} from "lucide-react";

import Home from "./pages/Home";
import Families from "./pages/Families";
import Festivals from "./pages/Festivals";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";
import Calendar from "./pages/Calendar";
import Gallery from "./pages/Gallery";
import Contacts from "./pages/Contacts";
import Announcements from "./pages/Announcements";
import Login from "./pages/Login";
import MyFamily from "./pages/MyFamily";
import MoreOptions from "./pages/MoreOptions";
import AboutUs from "./pages/AboutUs";
import License from "./pages/License";
import AdminDetails from "./pages/AdminDetails";
import ImportantPersons from "./pages/ImportantPersons";
import AboutVengamur from "./pages/AboutVengamur";
import FamilyFunctions from "./pages/FamilyFunctions";
import { ToastProvider } from "./components/Toast";
import { useToast } from "./components/useToast";
import ErrorBoundary from "./components/ErrorBoundary";


import "./App.css";

import { API_BASE_URL } from "./config";

const API_URL = API_BASE_URL;
// How often the app checks for new notifications in the background.
const NOTIFICATION_POLL_INTERVAL_MS = 30000;

function safeAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function AppShell() {
  const isAdmin = localStorage.getItem("userType") === "admin";
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const { t, i18n } = useTranslation();
  const toast = useToast();
  const notificationRef = useRef(null);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const menuItems = [
    { path: "/", label: t("home"), icon: HomeIcon },
    { path: "/families", label: t("families"), icon: Users },
    { path: "/festivals", label: t("festivals"), icon: CalendarDays },
    { path: "/payments", label: t("payments"), icon: IndianRupee },
    { path: "/expenses", label: t("expenses"), icon: Receipt },
    { path: "/calendar", label: t("calendar"), icon: CalendarDays },
    { path: "/gallery", label: t("gallery"), icon: Image },
    { path: "/contacts", label: t("contacts"), icon: Phone },
    { path: "/announcements", label: t("announcements"), icon: Bell },
    {
      path: "/family-functions",
      label: t("familyFunctions"),
      icon: PartyPopper,
    },
    { path: "/more", label: t("more"), icon: MoreHorizontal },
  ];

  // =====================================================
  // GET NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!silent) {
      setNotificationsLoading(true);
    }
    setNotificationsError("");

    try {
      const response = await fetch(`${API_URL}/api/notifications/`);

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications (${response.status})`);
      }

      const data = await response.json();
      const visible = Array.isArray(data)
        ? data.filter((item) => isAdmin || item.audience !== "ADMIN")
        : [];
      setNotifications(visible);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification fetch error:", error);
      // A background poll failing silently shouldn't nag the user with an
      // error banner every 30 seconds - only surface it for a manual/first load.
      if (!silent) {
        setNotificationsError(t("unableToLoadNotifications"));
      }
    } finally {
      if (!silent) {
        setNotificationsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll in the background so new notifications (e.g. payment reminders)
    // show up without the user needing to refresh the whole page.
    const intervalId = setInterval(() => {
      fetchNotifications({ silent: true });
    }, NOTIFICATION_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the notification dropdown when the user clicks outside of it.
  useEffect(() => {
    if (!showNotifications) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  // =====================================================
  // MARK NOTIFICATION AS READ
  // =====================================================

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to mark notification as read (${response.status})`
        );
      }

      await fetchNotifications({ silent: true });
    } catch (error) {
      console.error("Mark notification error:", error);
      toast.error(t("unableToMarkAsRead"));
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    const unread = notifications.filter((item) => !item.is_read);

    if (unread.length === 0) {
      return;
    }

    setMarkingAllRead(true);

    try {
      // Fire all requests together rather than one-by-one so it feels
      // instant even with a longer notification list.
      const results = await Promise.allSettled(
        unread.map((item) =>
          fetch(`${API_URL}/api/notifications/${item.id}/read/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          })
        )
      );

      const failures = results.filter(
        (result) => result.status === "rejected" || !result.value.ok
      );

      await fetchNotifications({ silent: true });

      if (failures.length > 0) {
        toast.error(t("unableToMarkAsRead"));
      } else {
        toast.success(t("allMarkedAsRead"));
      }
    } catch (error) {
      console.error("Mark all as read error:", error);
      toast.error(t("unableToMarkAsRead"));
    } finally {
      setMarkingAllRead(false);
    }
  };

  // =====================================================
  // GET PAYMENT DETAILS
  // =====================================================

  const fetchPaymentDetails = async () => {
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/payment-reminders/`
      );

      if (!response.ok) {
        throw new Error(`Payment API failed: ${response.status}`);
      }

      const data = await response.json();
      setPaymentDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Payment details error:", error);
      setPaymentError(t("unableToLoadDashboard"));
    } finally {
      setPaymentLoading(false);
    }
  };

  // =====================================================
  // NOTIFICATION CLICK
  // =====================================================

  const handleNotificationClick = async (notification) => {
    if (notification.notification_type === "PAYMENT") {
      setShowPaymentDetails(true);
      await fetchPaymentDetails();
    }

    if (notification.notification_type === "FAMILY_FUNCTION") {
      window.location.href = "/family-functions";
    }

    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  // =====================================================
  // CLOSE PAYMENT MODAL
  // =====================================================

  const closePaymentDetails = () => {
    setShowPaymentDetails(false);
    setPaymentError("");
  };

  const localeForDates = i18n.language === "ta" ? "ta-IN" : "en-IN";

  return (
    <BrowserRouter>
      <div className="app">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="header">
          <div className="header-brand">
            <img
              src="/vengamoor.png"
              alt=""
              className="header-logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <h1>{t("villageFestival")}</h1>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className={i18n.language === "en" ? "lang-active" : ""}
              onClick={() => changeLanguage("en")}
            >
              English
            </button>

            <button
              type="button"
              className={i18n.language === "ta" ? "lang-active" : ""}
              onClick={() => changeLanguage("ta")}
            >
              தமிழ்
            </button>

            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <div className="notification-container" ref={notificationRef}>
              <button
                type="button"
                className="notification-button"
                onClick={() => setShowNotifications((previous) => !previous)}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* =================================================
                  NOTIFICATION DROPDOWN
              ================================================= */}

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h3>{t("notifications")}</h3>

                    <span>{notifications.length}</span>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="notification-mark-all"
                        onClick={markAllAsRead}
                        disabled={markingAllRead}
                      >
                        <Check size={14} />
                        {t("markAllAsRead")}
                      </button>
                    )}
                  </div>

                  {notificationsLoading && (
                    <p className="no-notifications">{t("loading")}</p>
                  )}

                  {!notificationsLoading && notificationsError && (
                    <div className="notification-error">
                      {notificationsError}
                    </div>
                  )}

                  {!notificationsLoading &&
                    !notificationsError &&
                    notifications.length === 0 && (
                      <p className="no-notifications">
                        {t("noNotifications")}
                      </p>
                    )}

                  {!notificationsLoading &&
                    !notificationsError &&
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={
                          notification.is_read
                            ? "notification-item"
                            : "notification-item unread"
                        }
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-item-icon">
                          <Bell size={18} />
                        </div>

                        <div className="notification-item-content">
                          <strong>{notification.title}</strong>

                          <p>{notification.message}</p>

                          <small>
                            {notification.created_at
                              ? new Date(
                                  notification.created_at
                                ).toLocaleString(localeForDates)
                              : ""}
                          </small>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* =================================================
                LOGIN
            ================================================= */}

            <NavLink to="/login" className="login-link">
              <LogIn size={18} />
              {t("login")}
            </NavLink>
          </div>
        </header>

        {/* =================================================
            NAVBAR
        ================================================= */}

        <nav className="navbar">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/families" element={<Families />} />
              <Route path="/festivals" element={<Festivals />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/login" element={<Login />} />
              <Route path="/my-family" element={<MyFamily />} />
              <Route path="/more" element={<MoreOptions />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/license" element={<License />} />
              <Route path="/admin-details" element={<AdminDetails />} />
              <Route
                path="/important-persons"
                element={<ImportantPersons />}
              />
              <Route path="/about-vengamur" element={<AboutVengamur />} />
              <Route
                path="/family-functions"
                element={<FamilyFunctions />}
              />
            </Routes>
          </ErrorBoundary>
        </main>

        <footer className="app-footer">
          <p>
            © {new Date().getFullYear()} {t("villageFestival")}.{" "}
            {t("allRightsReserved")}
          </p>
        </footer>

        {/* =================================================
            PAYMENT DETAILS MODAL
        ================================================= */}

        {showPaymentDetails && (
          <div className="payment-modal-overlay" onClick={closePaymentDetails}>
            <div
              className="payment-modal"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}

              <div className="payment-modal-header">
                <div>
                  <h2>{t("paymentDetailsTitle")}</h2>
                  <p>{t("familyContributionStatus")}</p>
                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={closePaymentDetails}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body */}

              <div className="payment-modal-body">
                {paymentLoading && (
                  <div className="payment-status">
                    {t("loadingPaymentDetails")}
                  </div>
                )}

                {paymentError && (
                  <div className="payment-error">{paymentError}</div>
                )}

                {!paymentLoading &&
                  !paymentError &&
                  paymentDetails.length === 0 && (
                    <div className="payment-status">
                      {t("noPendingPayments")}
                    </div>
                  )}

                {!paymentLoading && paymentDetails.length > 0 && (
                  <div className="payment-list">
                    {paymentDetails.map((payment, index) => (
                      <div
                        className="payment-card"
                        key={`${payment.family_id}-${payment.festival_id}-${index}`}
                      >
                        <div className="payment-card-top">
                          <div>
                            <h3>{payment.family_name}</h3>

                            <p>
                              {payment.festival_name} {payment.year}
                            </p>
                          </div>

                          <span className="pending-badge">{t("pending")}</span>
                        </div>

                        <div className="payment-info-grid">
                          <div className="payment-info">
                            <span>{t("contribution")}</span>

                            <strong>
                              ₹{safeAmount(payment.contribution).toLocaleString(
                                localeForDates
                              )}
                            </strong>
                          </div>

                          <div className="payment-info">
                            <span>{t("paid")}</span>

                            <strong>
                              ₹
                              {safeAmount(payment.paid).toLocaleString(
                                localeForDates
                              )}
                            </strong>
                          </div>

                          <div className="payment-info pending-info">
                            <span>{t("pending")}</span>

                            <strong>
                              ₹
                              {safeAmount(payment.pending).toLocaleString(
                                localeForDates
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}

export default App;
