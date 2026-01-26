import React, { useState, useEffect } from 'react';
import { db } from '../db';

export const HistoryPage = ({ onClose }) => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSales = async () => {
            const allSales = await db.sales.orderBy('timestamp').reverse().toArray();
            setSales(allSales);
            setFilteredSales(allSales);
            setLoading(false);
        };
        loadSales();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredSales(sales);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = sales.filter(sale => {
            if (sale.items && Array.isArray(sale.items)) {
                return sale.items.some(item => item.name && item.name.toLowerCase().includes(lowerTerm));
            }
            return false;
        });
        setFilteredSales(filtered);
    }, [searchTerm, sales]);

    const formatDate = (isoString) => {
        if (!isoString) return 'Fecha desconocida';
        try {
            const date = new Date(isoString);
            return new Intl.DateTimeFormat('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (e) {
            return isoString;
        }
    };

    return (
        <div className="history-container-overlay" style={{ 
            height: '100%', 
            width: '100%', 
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            {/* Header with Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                     <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Historial de Ventas</h2>
                     {!loading && (
                        <p style={{ fontSize: '1rem', color: 'var(--text-color)', opacity: 0.8, marginTop: '5px' }}>
                            Total acumulado: <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>${filteredSales.reduce((acc, sale) => acc + (sale.total || 0), 0).toFixed(2)}</span>
                        </p>
                     )}
                </div>
                <button 
                    onClick={onClose}
                    style={{ 
                        padding: '8px 16px', 
                        background: 'transparent', 
                        color: 'var(--danger-color)', 
                        border: '1px solid var(--danger-color)', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Cerrar
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <i className='bx bx-search' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-color)', fontSize: '1.2rem' }}></i>
                    <input 
                        type="text" 
                        placeholder="Buscar por producto..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px 15px 12px 45px', 
                            borderRadius: '12px', 
                            border: 'none', 
                            background: 'var(--card-bg)',
                            color: 'var(--text-color)',
                            fontSize: '1rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Scroller List */}
            <div className="history-list" style={{ 
                flex: 1, 
                overflowY: 'auto', 
                paddingRight: '5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {loading ? (
                     <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-color)', opacity: 0.6 }}>Cargando historial...</div>
                ) : filteredSales.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-color)', opacity: 0.6 }}>No se encontraron ventas.</div>
                ) : (
                    filteredSales.map(sale => (
                        <div key={sale.id} className="sale-card" style={{ 
                            background: 'var(--card-bg)', 
                            borderRadius: '12px', 
                            padding: '20px', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            borderLeft: `4px solid ${sale.is_synced ? 'var(--accent-color)' : '#f39c12'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                             {/* Card Header: ID, Date, Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.7, fontWeight: '600', marginBottom: '4px' }}>
                                        ID: {sale.id}
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                        {formatDate(sale.timestamp)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        display: 'inline-block',
                                        padding: '4px 10px', 
                                        borderRadius: '12px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '700',
                                        background: sale.is_synced ? '#e6fffa' : '#fff3cd', 
                                        color: sale.is_synced ? '#2ecc71' : '#f39c12',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {sale.is_synced ? 'Sincronizado' : 'Pendiente'}
                                    </span>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '5px 0' }} />

                             {/* Items List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {sale.items && sale.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-color)' }}>
                                        <span>
                                            <span style={{ fontWeight: '500' }}>{item.name || item.nombre}</span>
                                            <span style={{ opacity: 0.6, fontSize: '0.85rem', marginLeft: '5px' }}>
                                                x {item.amount} {item.unit || 'kg'}
                                            </span>
                                        </span>
                                        <span style={{ fontWeight: '600' }}>${item.cost ? item.cost.toFixed(2) : '0.00'}</span>
                                    </div>
                                ))}
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '5px 0' }} />

                             {/* Total Footer */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.8 }}>Total Venta</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                                    ${sale.total ? sale.total.toFixed(2) : '0.00'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <style>{`
                .history-list::-webkit-scrollbar {
                    width: 6px;
                }
                .history-list::-webkit-scrollbar-track {
                    background: transparent;
                }
                .history-list::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .history-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};
