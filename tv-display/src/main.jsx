import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initErrorLogging } from './errorLog'
import './index.css'

import { registerSW } from 'virtual:pwa-register'
registerSW({
  immediate: true,
  onNeedRefresh() { window.location.reload() },
  onOfflineReady() {},
})

// Report uncaught errors to the RTDB logs node (see errorLog.js)
initErrorLogging()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
