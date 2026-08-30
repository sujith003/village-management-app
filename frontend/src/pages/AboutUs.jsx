import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Users } from "lucide-react";

function AboutUs() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="static-page">
      <button type="button" className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        {t("back")}
      </button>

      <div className="page-header">
        <div>
          <h1>{t("aboutAppTitle")}</h1>
        </div>
      </div>

      <div className="static-card">
        <p>{t("aboutAppIntro")}</p>
      </div>

      <div className="static-card">
        <h2>
          <Heart size={20} className="static-heading-icon" />
          {t("ourPurpose")}
        </h2>
        <p>{t("ourPurposeText")}</p>
      </div>

      <div className="static-card">
        <h2>
          <Users size={20} className="static-heading-icon" />
          {t("ourCommunity")}
        </h2>
        <p>{t("ourCommunityText")}</p>
      </div>
    </div>
  );
}

export default AboutUs;
