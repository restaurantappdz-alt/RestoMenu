import { Component } from 'react'

// Catches render errors in the TV layout tree so a 24/7 display never shows
// a permanent blank/broken screen. Shows a dark fallback with a manual
// "Reload" button and auto-reloads after 30 seconds so the TV recovers
// without a human.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this._reloadTimer = setTimeout(() => window.location.reload(), 30 * 1000)
  }

  componentWillUnmount() {
    if (this._reloadTimer) {
      clearTimeout(this._reloadTimer)
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-black text-white text-center p-8">
        <h1 className="font-heading font-bold text-4xl mb-4">Something went wrong</h1>
        <p className="text-white/60 text-xl mb-8">
          The menu display hit an unexpected error. It will reload automatically in a moment.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-xl bg-brand-orange text-white font-semibold text-xl"
        >
          Reload
        </button>
      </div>
    )
  }
}
