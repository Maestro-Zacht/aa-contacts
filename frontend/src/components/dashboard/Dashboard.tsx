import { useTranslation } from "react-i18next";
import AddTokenMenuEntries from "./AddTokenMenuEntries";
import AlliancesSection from "./AlliancesSection";
import CorporationsSection from "./CorporationsSection";


export default function Dashboard() {
    const { t } = useTranslation();

    return (
        <>
            <AddTokenMenuEntries />
            <h2 className="text-center mt-3 mb-5">{t("alliance.word", { count: 2 })}</h2>
            <AlliancesSection />
            <h2 className="text-center mt-5 mb-5">{t("corporation.word", { count: 2 })}</h2>
            <CorporationsSection />
        </>
    );
}
