import { Component, type ErrorInfo, type ReactNode } from 'react';
import { IconAlertTriangle } from '../icons/Icons';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
         return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)'
        }}>
          <div style={{
            background: 'var(--color-bg-secondary)',
            padding: 'var(--space-8)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <IconAlertTriangle size={48} color="var(--color-danger)" style={{ marginBottom: 'var(--space-4)' }} />
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>Something went wrong.</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
              An unexpected application error occurred. Our team has been notified.
            </p>
            
            <button 
               className="btn btn-primary"
               onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
               }}
            >
              Refresh Application
            </button>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <pre style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-4)',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
                textAlign: 'left',
                overflowX: 'auto',
                color: 'var(--color-danger)'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
