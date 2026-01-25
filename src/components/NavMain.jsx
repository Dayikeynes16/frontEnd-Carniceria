import { useState, useEffect } from "react";
import { ButtonCart, ButtonConfirmV2, ButtonDelete } from "./"

export const NavMain = () => {



  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  return (
    <div className="navMain">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
                height: '10px', 
                width: '10px', 
                backgroundColor: isOnline ? '#2ecc71' : '#e74c3c', 
                borderRadius: '50%', 
                display: 'inline-block' 
            }} title={isOnline ? "Online via Supabase" : "Offline Mode (Saved to Device)"}></span>
            <ButtonCart label={'Añadir'} />
            <ButtonConfirmV2 label={'Terminar'} />
        </div>
        <div>
            <ButtonDelete label={'Eliminar'} />    
        </div>
        
    </div>
  )
}
