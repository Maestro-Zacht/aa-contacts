import AddTokenMenuEntries from "./AddTokenMenuEntries";
import AlliancesSection from "./AlliancesSection";
import CorporationsSection from "./CorporationsSection";


export default function Dashboard() {
    return (
        <>
            <AddTokenMenuEntries />
            <h2 className="text-center mt-3 mb-5">Alliances</h2>
            <AlliancesSection />
            <h2 className="text-center mt-5 mb-5">Corporations</h2>
            <CorporationsSection />
        </>
    );
}
