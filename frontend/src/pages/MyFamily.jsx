import { useTranslation } from "react-i18next";

function MyFamily() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("myFamily")}</h1>

      <h2>{t("familyDetails")}</h2>

      <p>{t("familyName")}: Kumar Family</p>
      <p>{t("headName")}: R. Kumar</p>
      <p>{t("phone")}: 9876543210</p>
      <p>{t("address")}: Main Street</p>
      <p>{t("members")}: 4</p>

      <h2>{t("paymentDetails")}</h2>

      <p>{t("totalContribution")}: ₹1,000</p>
      <p>{t("paidAmount")}: ₹500</p>
      <p>{t("pendingAmount")}: ₹500</p>

      <h2>{t("messages")}</h2>

      <p>{t("noNewMessages")}</p>
    </div>
  );
}

export default MyFamily;
