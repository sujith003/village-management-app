import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScrollText } from "lucide-react";

function License() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <div className="static-page">
      <button type="button" className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        {t("back")}
      </button>

      <div className="page-header">
        <div>
          <h1>{t("licenseTitle")}</h1>
        </div>
      </div>

      <div className="static-card license-notice">
        <ScrollText size={22} />
        <p>
          © {year} {t("villageFestival")}. {t("allRightsReserved")}
        </p>
      </div>

      <div className="static-card">
        <h2>{t("licensePurpose")}</h2>
        <p>{t("licensePurposeText")}</p>
      </div>

      <div className="static-card">
        <h2>{t("usageStatement")}</h2>
        <p>{t("usageStatementText")}</p>
      </div>

      <div className="static-card">
        <h2>{t("basicLicense")}</h2>
        <p>{t("basicLicenseText")}</p>
      </div>
    </div>
  );
}

export default License;
