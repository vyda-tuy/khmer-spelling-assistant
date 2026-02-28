/**
 * Khmer Spelling & Pronunciation Assistant
 * Main Application Component
 */

import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import TextInput from './components/TextInput.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { useSpellCheck } from './hooks/useSpellCheck.js';
import { getStats } from './services/api.js';

export default function App() {
    const [stats, setStats] = useState(null);
    const [backendOnline, setBackendOnline] = useState(true);
    const { results, loading, error, checkSpelling, clearResults, lastText, clearError } = useSpellCheck();

    useEffect(() => {
        getStats()
            .then(setStats)
            .catch(() => setBackendOnline(false));
    }, []);

    const handleRetry = () => {
        if (lastText) checkSpelling(lastText);
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px' }}>
                <Header stats={stats} />

                {/* Backend warning */}
                {!backendOnline && (
                    <div className="card animate-fade-in" style={{ padding: '16px 20px', marginBottom: '32px', borderColor: '#FCA5A5', background: '#FEF2F2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#DC2626', fontWeight: 600 }}>Backend is offline</p>
                                    <p style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '2px' }}>
                                        Make sure the server is running at localhost:3001
                                    </p>
                                </div>
                            </div>
                            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                onClick={() => { getStats().then(s => { setStats(s); setBackendOnline(true); }).catch(() => { }); }}>
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Input */}
                <div style={{ marginBottom: '32px' }}>
                    <TextInput onSubmit={checkSpelling} loading={loading} />
                </div>

                {/* Loading */}
                {loading && (
                    <LoadingSpinner message="Checking spelling..." />
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="card animate-fade-in" style={{ padding: '20px 24px', marginBottom: '32px', borderColor: '#FCA5A5', background: '#FEF2F2' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚠️</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.875rem', color: '#DC2626', fontWeight: 600 }}>Something went wrong</p>
                                <p style={{ fontSize: '0.8125rem', color: '#B91C1C', marginTop: '4px' }}>{error}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                {lastText && (
                                    <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                        onClick={handleRetry}>
                                        Retry
                                    </button>
                                )}
                                <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                    onClick={clearError}>
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results or Initial State */}
                {!loading && (
                    <div style={{ marginTop: '8px' }}>
                        <ResultsPanel results={results} />
                    </div>
                )}

                {/* Footer */}
                <footer style={{ marginTop: '80px', textAlign: 'center', fontSize: '0.75rem', color: '#A1A1AA' }}>
                    <p>Royal Academy of Cambodia Dictionary · React · Node.js</p>
                </footer>
            </div>
        </div>
    );
}
