import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

if (typeof window !== 'undefined') {
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  } catch {}
  try {
    const vKey = 'marinesko_app_clean_v5'
    if (localStorage.getItem(vKey) !== 'true') {
      localStorage.clear()
      sessionStorage.clear()
      localStorage.setItem(vKey, 'true')
      if (window.indexedDB) {
        window.indexedDB.deleteDatabase('keyval-store')
      }
    }
  } catch {}
}

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
