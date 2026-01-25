import React from 'react'
import ReactDOM from 'react-dom/client';
import { MainMain } from './components/index';
import './main.css'
import { MetProvider } from './components/context/metProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
        <MetProvider>
            <MainMain />
        </MetProvider>
    //     {/* <TarggetMet mets={ {image: "src", name: 'Carne Molida', price: 23, gram: 'kg'} } /> */}
    // {/* </React.StrictMode>, */}
    
)
