import React, { useContext } from 'react';
import { MetContext } from './context/metContext';

export const StatusIndicator = () => {
    const { isOnline } = useContext(MetContext);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} title={isOnline ? "Conectado a Supabase" : "Modo Offline (Guardado local)"}>
            <span style={{ 
                height: '10px', 
                width: '10px', 
                backgroundColor: isOnline ? '#2ecc71' : '#e74c3c', 
                borderRadius: '50%', 
                display: 'inline-block',
                boxShadow: isOnline ? '0 0 5px #2ecc71' : 'none'
            }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
};
