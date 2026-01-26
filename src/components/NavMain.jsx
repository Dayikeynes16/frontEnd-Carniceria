import { useContext } from "react";
import { ButtonCart, ButtonConfirmV2, ButtonDelete } from "./"
import { StatusIndicator } from "./StatusIndicator";
import { MetContext } from "./context/metContext";

export const NavMain = () => {

  const { setCurrentView } = useContext(MetContext);

  return (
    <div className="navMain">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <StatusIndicator />
            <ButtonCart label={'Añadir'} />
            <ButtonConfirmV2 label={'Terminar'} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={() => setCurrentView('HISTORY')}
                style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', background: 'var(--card-bg)', color: 'var(--text-color)' }}
            >
                Historial
            </button>
            <button 
                onClick={() => setCurrentView('SETTINGS')}
                style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', background: 'var(--card-bg)', color: 'var(--text-color)' }}
            >
                Configuración
            </button>
            <ButtonDelete label={'Eliminar'} />    
        </div>
        
    </div>
  )
}
