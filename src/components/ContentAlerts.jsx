import { useContext, useEffect } from "react";
import { MetContext } from "./context/metContext";

const AlertItem = ({ data, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(data.id);
        }, 3000); // Dismiss after 3 seconds
        return () => clearTimeout(timer);
    }, [data.id, onDismiss]);

    return (
        <div className="custom-snackbar" style={{
            background: '#ffffff',
            color: '#333',
            padding: '15px 20px',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#2ecc71',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '24px',
                flexShrink: 0
            }}>
                <i className='bx bx-check'></i>
            </div>
            <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{data.msg || 'Acción exitosa'}</h4>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Recibo generado #{String(data.id).padStart(4, '0')}</p>
            </div>
        </div>
    );
};

export const ContentAlerts = () => {

    const { alert, setAlert } = useContext( MetContext );

    const handleDismiss = (id) => {
        setAlert(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="contentAlerts" style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center'
        }}>
            {
                alert.map( a => <AlertItem key={a.id} data={a} onDismiss={handleDismiss} /> )
            }
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
