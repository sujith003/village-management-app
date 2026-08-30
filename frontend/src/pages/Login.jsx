import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Users,
  Lock,
  UserRound,
  ArrowLeft,
} from "lucide-react";

import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loginType, setLoginType] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      // The server might not always return JSON (e.g. a 500 error page),
      // so parse defensively instead of assuming valid JSON.
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status >= 500) {
          // Wrong credentials never cause a 5xx - this means the server
          // itself failed (DB not migrated, DB connection down, etc.),
          // so show that distinctly instead of blaming the password.
          setError(t("serverErrorDuringLogin"));
        } else {
          setError(t("invalidUsernameOrPassword"));
        }
        return;
      }

      if (!data?.token) {
        setError(t("serverErrorDuringLogin"));
        return;
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userType", "admin");

      window.dispatchEvent(new Event("login"));

      navigate("/");
    } catch (error) {
      console.error(error);
      setError(t("unableToConnectServer"));
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/send-otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("unableToSendOtp"));
        return;
      }

      setGeneratedOtp(data.otp);
      setOtpSent(true);
      setMessage(t("otpGeneratedSuccess"));
    } catch (error) {
      console.error(error);
      setError(t("unableToConnectServer"));
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp === generatedOtp) {
      localStorage.setItem("userType", "public");
      localStorage.setItem("publicPhone", phone);

      window.dispatchEvent(new Event("login"));

      navigate("/");
    } else {
      setError(t("invalidOtp"));
    }
  };

  const goBack = () => {
    setLoginType(null);
    setError("");
    setMessage("");
    setOtpSent(false);
    setOtp("");
    setGeneratedOtp("");
  };

  if (!loginType) {
    return (
      <div className="login-page">
        <div className="login-selection">

          <h1>{t("villageFestival")}</h1>

          <p>{t("selectLoginType")}</p>

          <div className="login-options">

            <button
              className="login-option"
              onClick={() => setLoginType("public")}
            >
              <Users size={32} />

              <h2>{t("publicUser")}</h2>

              <p>{t("loginWithMobile")}</p>
            </button>

            <button
              className="login-option"
              onClick={() => setLoginType("admin")}
            >
              <ShieldCheck size={32} />

              <h2>{t("admin")}</h2>

              <p>{t("loginToManage")}</p>
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <button
          className="back-button"
          onClick={goBack}
          type="button"
        >
          <ArrowLeft size={18} />
          {t("back")}
        </button>

        {loginType === "admin" ? (
          <>
            <div className="login-icon">
              <ShieldCheck size={25} />
            </div>

            <h1>{t("adminLogin")}</h1>

            <p>{t("loginToManage")}</p>

            <form onSubmit={handleAdminLogin}>

              <label>{t("username")}</label>

              <div className="login-input">
                <UserRound size={18} />

                <input
                  type="text"
                  placeholder={t("enterUsername")}
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                />
              </div>

              <label>{t("password")}</label>

              <div className="login-input">
                <Lock size={18} />

                <input
                  type="password"
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
              >
                {t("login")}
              </button>

            </form>
          </>
        ) : (
          <>
            <div className="login-icon">
              <Users size={25} />
            </div>

            <h1>{t("publicUserLogin")}</h1>

            <p>{t("loginWithMobile")}</p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>

                <label>{t("mobileNumber")}</label>

                <div className="login-input">
                  <Users size={18} />

                  <input
                    type="tel"
                    placeholder={t("enterMobileNumber")}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    maxLength="10"
                    required
                  />
                </div>

                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="login-button"
                >
                  {t("sendOtp")}
                </button>

              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>

                <label>{t("enterOtp")}</label>

                <div className="login-input">
                  <Lock size={18} />

                  <input
                    type="text"
                    placeholder={t("enterSixDigitOtp")}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value)
                    }
                    maxLength="6"
                    required
                  />
                </div>

                {message && (
                  <div className="login-message">
                    {message}
                  </div>
                )}

                <div className="otp-display">
                  {t("yourOtp")}{" "}
                  <strong>{generatedOtp}</strong>
                </div>

                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="login-button"
                >
                  {t("verifyOtp")}
                </button>

              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default Login;