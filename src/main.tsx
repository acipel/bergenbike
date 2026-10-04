import '@fontsource-variable/public-sans/wght.css'
import '@fontsource-variable/public-sans/wght-italic.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
