import AddTokenMenuEntries from "./AddTokenMenuEntries";
import AlliancesSection from "./AlliancesSection";
import CorporationsSection from "./CorporationsSection";


export default function Dashboard() {
    return (
        <>
            <AddTokenMenuEntries />
            <h2 className="text-center mt-3 mb-4">Alliances</h2>
            <AlliancesSection />
            <h2 className="text-center mt-3 mb-4">Corporations</h2>
            <CorporationsSection />
        </>
    );
}
