import { ref, set, serverTimestamp } from 'firebase/database'
import { rtdb } from './firebase'

/**
 * Global error reporting for the TV app.
 *
 * Writes uncaught errors and unhandled promise rejections to the Realtime
 * Database at logs/errors/* so they can be inspected in the Firebase
 * Console. Uses the project's existing RTDB — no extra service, no account.
 *
 * Rules: see rtdb.rules.json ("logs" node) — anyone may append, nobody may
 * read via rules (read via the Firebase Console with your own credentials).
 */

const MAX_MESSAGE = 2000
const MAX_STACK = 4000

function report(message, stack, source) {
  try {
    const entryRef = ref(
      rtdb,
      `logs/errors/${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    )
    set(entryRef, {
      message: String(message ?? 'unknown error').slice(0, MAX_MESSAGE),
      stack: String(stack ?? '').slice(0, MAX_STACK),
      url: window.location.href.slice(0, 500),
      source,
      ts: serverTimestamp(),
      ua: navigator.userAgent.slice(0, 300),
    }).catch(() => {})
  } catch {
    // Logging must never break the app
  }
}

export function initErrorLogging() {
  window.addEventListener('error', (event) => {
    report(event.message, event.error?.stack, 'window.onerror')
  })
  window.addEventListener('unhandledrejection', (event) => {
    report(event.reason?.message ?? event.reason, event.reason?.stack, 'unhandledrejection')
  })
}
