import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyPalette, getStoredPalette } from './theme/palettes'

// Aplica a paleta salva antes do render para evitar flash de cor.
applyPalette(getStoredPalette())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
