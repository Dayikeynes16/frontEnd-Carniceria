import React, { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../helpers/settings';
import { syncSales } from '../helpers/sales'; // We'll assume this is exported or we import from helper
// Note: syncSales might need to be imported dynamically if not exposed, but we exported it in sales.js

export const SettingsPage = ({ onClose }) => {
    const [balanza, setBalanza] = useState(1);
    const [maxSales, setMaxSales] = useState(500);
    const [theme, setTheme] = useState('light');
    const [isSyncing, setIsSyncing] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            const b = await getSetting('balanza', 1);
            const m = await getSetting('max_local_sales', 500);
            const t = await getSetting('theme', 'light');
            setBalanza(b);
            setMaxSales(m);
            setTheme(t);
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaveStatus('Guardando...');
        await setSetting('balanza', parseInt(balanza));
        await setSetting('max_local_sales', parseInt(maxSales));
        await setSetting('theme', theme);
        
        // Apply theme immediately
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        setSaveStatus('¡Guardado!');
        setTimeout(() => setSaveStatus(''), 2000);
    };

    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            await syncSales();
            setSaveStatus('Sincronización completada');
        } catch (error) {
            console.error(error);
            setSaveStatus('Error al sincronizar');
        } finally {
            setIsSyncing(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    return (
        <div className="settings-container-overlay" style={{ 
            height: '100%', 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'var(--bg-color)',
            padding: '20px' 
        }}>
            <div className="settings-card" style={{ 
                background: 'var(--card-bg)', 
                width: '100%', 
                maxWidth: '600px', 
                borderRadius: '16px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                padding: '40px',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-color)' }}>Configuración</h2>
                     <span style={{ 
                        padding: '5px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        background: navigator.onLine ? '#e6fffa' : '#fff5f5', 
                        color: navigator.onLine ? '#2ecc71' : '#e74c3c',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                        {navigator.onLine ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>

                <div className="settings-form">
                    {/* Balanza Section */}
                    <div className="input-group" style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>Número de Balanza</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="number" 
                                value={balanza} 
                                onChange={(e) => setBalanza(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 15px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-color)', 
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                <i className='bx bx-station'></i>
                            </span>
                        </div>
                        <small style={{ display: 'block', marginTop: '5px', opacity: 0.6, fontSize: '0.8rem' }}>Identificador único para este terminal.</small>
                    </div>

                    {/* Limits Section */}
                    <div className="input-group" style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>Máximo de Ventas Locales</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="number" 
                                value={maxSales} 
                                onChange={(e) => setMaxSales(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 15px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-color)', 
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                             <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                <i className='bx bx-data'></i>
                            </span>
                        </div>
                        <small style={{ display: 'block', marginTop: '5px', opacity: 0.6, fontSize: '0.8rem' }}>Límite de ventas guardadas en dispositivo para optimizar rendimiento.</small>
                    </div>

                    {/* Theme Section */}
                    <div className="input-group" style={{ marginBottom: '35px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>Tema de la Aplicación</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setTheme('light')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: `2px solid ${theme === 'light' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className='bx bx-sun'></i> Claro
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: `2px solid ${theme === 'dark' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className='bx bx-moon'></i> Oscuro
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button 
                            onClick={handleSave}
                            style={{ 
                                padding: '14px', 
                                background: 'var(--accent-color)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(38, 115, 101, 0.2)',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <i className='bx bx-save' style={{ marginRight: '8px' }}></i>
                            Guardar Configuración
                        </button>
                        
                         <button 
                            onClick={handleManualSync}
                            disabled={!navigator.onLine || isSyncing}
                            style={{ 
                                padding: '14px', 
                                background: 'transparent', 
                                color: 'var(--accent-color)', 
                                border: '1px solid var(--accent-color)', 
                                borderRadius: '8px',
                                cursor: (!navigator.onLine || isSyncing) ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                opacity: (!navigator.onLine || isSyncing) ? 0.5 : 1
                            }}
                        >
                            <i className={`bx ${isSyncing ? 'bx-loader-alt bx-spin' : 'bx-cloud-upload'}`} style={{ marginRight: '8px' }}></i>
                            {isSyncing ? 'Sincronizando...' : 'Forzar Sincronización con Supabase'}
                        </button>

                        <button 
                            onClick={onClose}
                            style={{ 
                                marginTop: '10px',
                                padding: '10px', 
                                background: 'transparent', 
                                color: 'var(--danger-color)', 
                                border: 'none', 
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Cerrar
                        </button>
                    </div>

                    {saveStatus && (
                        <div style={{ 
                            marginTop: '20px', 
                            textAlign: 'center', 
                            color: saveStatus.includes('Error') ? 'var(--danger-color)' : 'var(--accent-color)', 
                            fontWeight: '600',
                            animation: 'fadeIn 0.3s' 
                        }}>
                            {saveStatus}
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
