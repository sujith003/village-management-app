import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Users,
  BookOpen,
  Landmark,
  Bus,
  Train,
  Plane,
  CreditCard,
  Mail,
  Stethoscope,
  Check,
  X as XIcon,
} from "lucide-react";

const StatusPill = ({ available, t }) => (
  <span
    className={
      available ? "status-pill status-yes" : "status-pill status-no"
    }
  >
    {available ? <Check size={13} /> : <XIcon size={13} />}
    {available ? t("statusAvailable") : t("statusNotAvailable")}
  </span>
);

const ServiceTable = ({ rows, t }) => (
  <>
    {/* Table on wider screens */}
    <div className="vg-table-wrap">
      <table className="vg-table">
        <thead>
          <tr>
            <th>{t("connectivityCol")}</th>
            <th>{t("statusCol")}</th>
            <th>{t("nearestAvailabilityCol")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.labelKey}>
              <td>{t(row.labelKey)}</td>
              <td>
                <StatusPill available={row.available} t={t} />
              </td>
              <td>{row.availabilityKey ? t(row.availabilityKey) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Card list on mobile */}
    <div className="vg-service-cards">
      {rows.map((row) => (
        <div className="vg-service-card" key={row.labelKey}>
          <div className="vg-service-card-top">
            <strong>{t(row.labelKey)}</strong>
            <StatusPill available={row.available} t={t} />
          </div>
          <span className="vg-service-card-meta">
            {row.availabilityKey ? t(row.availabilityKey) : "—"}
          </span>
        </div>
      ))}
    </div>
  </>
);

function AboutVengamur() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Population breakdown — figures are from Census 2011, kept exactly as
  // provided (not recalculated or updated to any newer estimate).
  const populationRows = [
    { labelKey: "rowTotalPopulation", total: "1,315", male: "669", female: "646" },
    { labelKey: "rowChildPopulation", total: "139", male: "76", female: "63" },
    { labelKey: "rowSC", total: "285", male: "139", female: "146" },
    { labelKey: "rowST", total: "152", male: "77", female: "75" },
    { labelKey: "rowLiterate", total: "793", male: "448", female: "345" },
    { labelKey: "rowIlliterate", total: "522", male: "221", female: "301" },
  ];

  const nearbyVillages = [
    { name: "Hanumanthapuram", directionKey: "directionNE", distance: "1.69 km" },
    { name: "Udaiyanatham", directionKey: "directionW", distance: "1.78 km" },
    { name: "Attiyur Thirukkai", directionKey: "directionSE", distance: "2.20 km" },
    { name: "Udaiyanattam R.f.", directionKey: "directionW", distance: "2.63 km" },
    { name: "Kulirsunai", directionKey: "directionSW", distance: "2.73 km" },
    { name: "Vellayaimbattu", directionKey: "directionNE", distance: "3.04 km" },
    { name: "Thirukkunam", directionKey: "directionE", distance: "3.15 km" },
    { name: "Karuvakshi", directionKey: "directionN", distance: "3.34 km" },
    { name: "Kilvalai", directionKey: "directionSW", distance: "3.53 km" },
    { name: "Othiyathur", directionKey: "directionS", distance: "3.53 km" },
  ];

  const transportRows = [
    { labelKey: "publicBusService", available: true, availabilityKey: "availableWithinVillage" },
    { labelKey: "privateBusService", available: false, availabilityKey: "availableWithin3km" },
    { labelKey: "railwayStation", available: false, availabilityKey: null },
  ];

  const bankingRows = [
    { labelKey: "bank", available: false, availabilityKey: "availableWithin2to5km" },
    { labelKey: "atm", available: false, availabilityKey: "availableWithin5to10km" },
    { labelKey: "postOffice", available: true, availabilityKey: "availableWithinVillage" },
  ];

  const healthRows = [
    { labelKey: "healthSubCentre", available: false, availabilityKey: "availableWithin2to5km" },
    { labelKey: "primaryHealthCentre", available: false, availabilityKey: "availableWithin5to10km" },
    { labelKey: "communityHealthCentre", available: false, availabilityKey: "availableWithin2to5km" },
  ];

  return (
    <div className="vg-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/more")}
      >
        <ArrowLeft size={18} />
        {t("back")}
      </button>

      {/* ===== Header ===== */}
      <div className="vg-hero">
        <img
          src="/vengamoor.png"
          alt=""
          className="vg-hero-logo"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <div>
          <h1>{t("aboutVengamurTitle")}</h1>
        </div>
      </div>

      {/* ===== Introduction ===== */}
      <div className="static-card">
        <p>{t("aboutVengamurIntro1")}</p>
        <p>{t("aboutVengamurIntro2")}</p>
        <p>{t("aboutVengamurIntro3")}</p>

        <div className="vg-fact-grid">
          <div className="vg-fact">
            <MapPin size={16} />
            <span>{t("villageCode")}</span>
            <strong>632836</strong>
          </div>
          <div className="vg-fact">
            <Landmark size={16} />
            <span>{t("geographicalArea")}</span>
            <strong>307.35 {t("hectares")}</strong>
          </div>
          <div className="vg-fact">
            <Mail size={16} />
            <span>{t("pincode")}</span>
            <strong>605701</strong>
          </div>
          <div className="vg-fact">
            <MapPin size={16} />
            <span>{t("nearestTown")}</span>
            <strong>Tirukoilur — 15 {t("kmAway")}</strong>
          </div>
          <div className="vg-fact">
            <Landmark size={16} />
            <span>{t("assemblyConstituency")}</span>
            <strong>Vikravandi</strong>
          </div>
          <div className="vg-fact">
            <Landmark size={16} />
            <span>{t("parliamentaryConstituency")}</span>
            <strong>Viluppuram</strong>
          </div>
        </div>
      </div>

      {/* ===== Population ===== */}
      <div className="static-card">
        <h2>
          <span className="static-heading-icon">
            <Users size={18} />
          </span>
          {t("populationOfVengamur")}
        </h2>
        <p className="vg-note">{t("populationCensusNote")}</p>
        <p>{t("populationIntro")}</p>

        <div className="vg-stat-row">
          <div className="vg-stat-chip">
            <span>{t("totalPopulationStat")}</span>
            <strong>1,315</strong>
          </div>
          <div className="vg-stat-chip">
            <span>{t("householdsStat")}</span>
            <strong>337</strong>
          </div>
          <div className="vg-stat-chip">
            <span>{t("sexRatioStat")}</span>
            <strong>966</strong>
          </div>
          <div className="vg-stat-chip">
            <span>{t("literacyRateStat")}</span>
            <strong>67.43%</strong>
          </div>
        </div>

        <div className="vg-table-wrap">
          <table className="vg-table">
            <thead>
              <tr>
                <th>{t("populationTableCategory")}</th>
                <th>{t("populationTableTotal")}</th>
                <th>{t("populationTableMale")}</th>
                <th>{t("populationTableFemale")}</th>
              </tr>
            </thead>
            <tbody>
              {populationRows.map((row) => (
                <tr key={row.labelKey}>
                  <td>{t(row.labelKey)}</td>
                  <td>{row.total}</td>
                  <td>{row.male}</td>
                  <td>{row.female}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card layout for the same data on mobile */}
        <div className="vg-population-cards">
          {populationRows.map((row) => (
            <div className="vg-population-card" key={row.labelKey}>
              <strong>{t(row.labelKey)}</strong>
              <div className="vg-population-card-values">
                <span>
                  {t("populationTableTotal")}: <b>{row.total}</b>
                </span>
                <span>
                  {t("populationTableMale")}: <b>{row.male}</b>
                </span>
                <span>
                  {t("populationTableFemale")}: <b>{row.female}</b>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Nearby Villages ===== */}
      <div className="static-card">
        <h2>
          <span className="static-heading-icon">
            <MapPin size={18} />
          </span>
          {t("nearbyVillagesTitle")}
        </h2>

        <div className="vg-table-wrap">
          <table className="vg-table">
            <thead>
              <tr>
                <th>{t("nearbyVillageCol")}</th>
                <th>{t("directionCol")}</th>
                <th>{t("distanceCol")}</th>
              </tr>
            </thead>
            <tbody>
              {nearbyVillages.map((village) => (
                <tr key={village.name}>
                  <td>{village.name}</td>
                  <td>{t(village.directionKey)}</td>
                  <td>{village.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="vg-service-cards">
          {nearbyVillages.map((village) => (
            <div className="vg-service-card" key={village.name}>
              <div className="vg-service-card-top">
                <strong>{village.name}</strong>
                <span className="vg-distance-badge">{village.distance}</span>
              </div>
              <span className="vg-service-card-meta">
                {t(village.directionKey)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Transport ===== */}
      <div className="static-card">
        <h2>
          <span className="static-heading-icon">
            <Bus size={18} />
          </span>
          {t("transportTitle")}
        </h2>
        <p>{t("transportIntro")}</p>

        <div className="vg-icon-row">
          <span>
            <Train size={16} /> Ayandur
          </span>
          <span>
            <Plane size={16} /> Pondicherry — 38.3 km
          </span>
        </div>

        <ServiceTable rows={transportRows} t={t} />

        <p className="vg-note">{t("transportRoadNote")}</p>
      </div>

      {/* ===== Banking & Postal ===== */}
      <div className="static-card">
        <h2>
          <span className="static-heading-icon">
            <CreditCard size={18} />
          </span>
          {t("bankingTitle")}
        </h2>

        <ServiceTable rows={bankingRows} t={t} />
      </div>

      {/* ===== Health Facilities ===== */}
      <div className="static-card">
        <h2>
          <span className="static-heading-icon">
            <Stethoscope size={18} />
          </span>
          {t("healthTitle")}
        </h2>

        <ServiceTable rows={healthRows} t={t} />
      </div>

      <p className="vg-census-footnote">
        <BookOpen size={14} />
        {t("censusDataNote")}
      </p>
    </div>
  );
}

export default AboutVengamur;
