import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Starlet App Fatal Error Caught:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#09070a',
          color: '#f5efe6',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: '#151116',
            border: '1px solid rgba(245,239,230,0.15)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <h1 style={{ color: '#fb7185', fontSize: '1.4rem', marginBottom: '0.8rem' }}>
              ⚠️ Application Recovery Mode
            </h1>
            <p style={{ color: '#a69b93', fontSize: '0.88rem', marginBottom: '1.2rem', lineHeight: '1.5' }}>
              An unexpected error occurred during rendering. Details below:
            </p>
            <pre style={{
              background: '#09070a',
              color: '#fca5a5',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              textAlign: 'left',
              overflowX: 'auto',
              maxHeight: '160px',
              marginBottom: '1.5rem',
              border: '1px solid rgba(251,113,133,0.2)'
            }}>
              {this.state.error?.toString()}
            </pre>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button
                onClick={async () => {
                  try {
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      for (const reg of regs) await reg.unregister();
                    }
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      for (const k of keys) await caches.delete(k);
                    }
                  } catch {}
                  window.location.reload();
                }}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '9999px',
                  background: '#d4a853',
                  color: '#09070a',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Clear Cache &amp; Reload Fresh
              </button>
              <button
                onClick={async () => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      for (const reg of regs) await reg.unregister();
                    }
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      for (const k of keys) await caches.delete(k);
                    }
                  } catch {}
                  window.location.reload();
                }}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '9999px',
                  background: '#241b25',
                  color: '#f5efe6',
                  border: '1px solid rgba(245,239,230,0.15)',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Reset Saved State
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register Service Worker for PWA (v8 with cache-bypass update check)
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js?v=8', { updateViaCache: 'none' })
      .then((reg) => {
        try { reg.update(); } catch {}
      })
      .catch(() => {});
  });
}
