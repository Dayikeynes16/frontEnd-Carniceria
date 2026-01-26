import { BoxMain } from "./BoxMain";
import { NavMain } from "./NavMain";
import { useContext } from "react";
import { ContentMet } from "./ContentMet";
import { MetContext } from "./context/metContext";
import { Loading } from "./Loading";
import { ContentAlerts } from './ContentAlerts';
import { SettingsPage } from "./SettingsPage";
import { HistoryPage } from "./HistoryPage";

export const MainMain = () => {

    const { screenMet, loading, currentView, setCurrentView } = useContext( MetContext )

    return (
        <>
            { loading && <Loading /> }

            <ContentAlerts />

            { screenMet &&  <ContentMet /> }

            <NavMain />
            
            {currentView === 'POS' && <BoxMain />}
            
            {currentView === 'SETTINGS' && (
                <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, bottom: 0, zIndex: 50, background: 'var(--bg-color)' }}>
                    <SettingsPage onClose={() => setCurrentView('POS')} />
                </div>
            )}

            {currentView === 'HISTORY' && (
                 <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, bottom: 0, zIndex: 50, background: 'var(--bg-color)' }}>
                    <HistoryPage onClose={() => setCurrentView('POS')} />
                </div>
            )}
        </>
    )
}
