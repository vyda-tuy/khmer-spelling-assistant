import { useState } from 'react';

/**
 * TextInput — clean, spacious text area with action bar
 */
export default function TextInput({ onSubmit, loading }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !loading) {
            onSubmit(text.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e);
        }
    };

    const charCount = [...text].length;
    const hasKhmer = /[\u1780-\u17FF]/.test(text);
    const showKhmerWarning = text.trim().length > 0 && !hasKhmer;

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative' }}>
                <textarea
                    id="khmer-text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="វាយអក្សរខ្មែរនៅទីនេះ... (Type Khmer text here...)"
                    rows={4}
                    maxLength={5000}
                    className="khmer-input"
                    style={{ width: '100%', padding: '16px', paddingBottom: '36px', resize: 'none' }}
                />

                {showKhmerWarning && (
                    <div style={{
                        position: 'absolute', top: '10px', right: '14px',
                        background: '#FEF2F2', color: '#DC2626',
                        padding: '4px 8px', borderRadius: '6px',
                        fontSize: '0.75rem', fontWeight: 500,
                        border: '1px solid #FEE2E2',
                        pointerEvents: 'none',
                        zIndex: 10
                    }}>
                        Khmer text preferred
                    </div>
                )}

                {charCount > 0 && (
                    <span style={{
                        position: 'absolute', bottom: '10px', right: '14px',
                        fontSize: '0.875rem', color: charCount > 4500 ? '#DC2626' : '#A1A1AA',
                        pointerEvents: 'none',
                        zIndex: 10
                    }}>
                        {charCount.toLocaleString()} / 5,000
                    </span>
                )}
            </div>

            {/* Action bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '0.875rem', color: '#A1A1AA' }}>
                        ⌘+Enter to submit
                    </p>
                    {showKhmerWarning && (
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', opacity: 0.8 }}>
                            (No Khmer chars detected)
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {text.trim() && (
                        <button type="button" onClick={() => setText('')} className="btn-secondary">
                            Clear
                        </button>
                    )}
                    <button type="submit" disabled={!text.trim() || loading} className="btn-primary">
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                                Checking...
                            </>
                        ) : 'Check Spelling'}
                    </button>
                </div>
            </div>
        </form>
    );
}
