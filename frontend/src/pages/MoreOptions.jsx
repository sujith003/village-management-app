import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  UserCog,
  Info,
  Users2,
  ScrollText,
  MapPin,
  ChevronRight,
} from "lucide-react";

function MoreOptions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const options = [
    {
      path: "/admin-details",
      icon: UserCog,
      title: t("adminDetailsMenuTitle"),
      desc: t("adminDetailsMenuDesc"),
    },
    {
      path: "/important-persons",
      icon: Users2,
      title: t("importantPersonsMenuTitle"),
      desc: t("importantPersonsMenuDesc"),
    },
    {
      path: "/about-vengamur",
      icon: MapPin,
      title: t("aboutVengamurMenuTitle"),
      desc: t("aboutVengamurMenuDesc"),
    },
    {
      path: "/about",
      icon: Info,
      title: t("aboutUsMenuTitle"),
      desc: t("aboutUsMenuDesc"),
    },
    {
      path: "/license",
      icon: ScrollText,
      title: t("licenseMenuTitle"),
      desc: t("licenseMenuDesc"),
    },
  ];

  return (
    <div className="more-options-page">
      <div className="page-header">
        <div>
          <h1>{t("moreOptions")}</h1>
          <p>{t("moreOptionsSubtitle")}</p>
        </div>
      </div>

      <div className="more-options-grid">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <button
              type="button"
              className="more-options-card"
              key={option.path}
              onClick={() => navigate(option.path)}
            >
              <span className="more-options-icon">
                <Icon size={22} />
              </span>

              <span className="more-options-text">
                <strong>{option.title}</strong>
                <span>{option.desc}</span>
              </span>

              <ChevronRight size={18} className="more-options-chevron" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MoreOptions;
