import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', maxWidth: '600px', margin: '40px auto', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
                    <div style={{ background: '#FEF2F2', padding: '32px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>💥</span>
                        <h1 style={{ color: '#991B1B', fontSize: '1.5rem', marginBottom: '8px' }}>Something went wrong</h1>
                        <p style={{ color: '#B91C1C', marginBottom: '24px' }}>We're sorry, the application encountered an unexpected error.</p>

                        <button
                            onClick={() => window.location.reload()}
                            style={{ padding: '10px 20px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Reload Application
                        </button>

                        <div style={{ marginTop: '24px', textAlign: 'left', background: '#F8717122', padding: '16px', borderRadius: '6px', color: '#7F1D1D', fontSize: '0.875rem', overflowX: 'auto' }}>
                            <strong>Error details:</strong><br />
                            {this.state.error?.message || 'Unknown error'}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
