/**
 * ResultsPanel — clean, spacious spelling results
 */
import AudioPlayer from './AudioPlayer.jsx';

function SourceBadge({ source }) {
    const cls = {
        'RAC Dictionary': 'badge-dictionary',
        'Fuzzy Match': 'badge-fuzzy',
        'Gemini AI': 'badge-ai',
        'not-found': 'badge-not-found'
    }[source] || 'badge-not-found';

    return <span className={`badge ${cls}`}>{source === 'not-found' ? 'Not Found' : source}</span>;
}

function WordCard({ result, index }) {
    const { original, corrected, isCorrect, source, confidence, suggestions, definition, pos, ipa } = result;

    return (
        <div
            className="card animate-fade-in"
            style={{ padding: '24px 32px', animationDelay: `${index * 60}ms` }}
        >
            {/* Word + badge row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                        className={`font-khmer ${isCorrect ? 'word-correct' : source === 'not-found' ? 'word-not-found' : 'word-corrected'}`}
                        style={{ fontSize: '1.75rem' }}
                    >
                        {corrected}
                    </span>
                    <SourceBadge source={source} />
                    {confidence > 0 && confidence < 1 && (
                        <span style={{ fontSize: '0.875rem', color: '#A1A1AA' }}>
                            {Math.round(confidence * 100)}%
                        </span>
                    )}
                </div>
                <AudioPlayer text={corrected} />
            </div>

            {/* Correction diff + explanation */}
            {!isCorrect && source !== 'not-found' && (
                <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '1.125rem', color: '#71717A' }}>
                        <span className="font-khmer" style={{ textDecoration: 'line-through', color: '#DC2626', opacity: 0.7 }}>{original}</span>
                        <span style={{ margin: '0 8px', color: '#D4D4D4' }}>→</span>
                        <span className="font-khmer" style={{ color: '#D97706' }}>{corrected}</span>
                    </p>
                    {result.explanation && (
                        <p style={{ fontSize: '0.875rem', color: '#A1A1AA', marginTop: '4px', fontStyle: 'italic' }}>
                            {result.explanation}
                        </p>
                    )}
                </div>
            )}

            {/* Definitions */}
            {(result.allEntries || definition) && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F5F5F5' }}>
                    {result.allEntries ? (
                        result.allEntries.map((e, i) => (
                            <div key={i} style={{ marginBottom: i < result.allEntries.length - 1 ? '16px' : 0 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    {e.pos && <span style={{ fontSize: '0.875rem', color: '#7C3AED', fontWeight: 600, minWidth: '40px' }}>{e.pos}</span>}
                                    <p className="font-khmer" style={{ fontSize: '1.125rem', color: '#3F3F46', lineHeight: '1.7', margin: 0 }}>
                                        {e.definition}
                                    </p>
                                </div>
                                {e.example && (
                                    <p className="font-khmer" style={{ fontSize: '1rem', color: '#71717A', marginTop: '6px', paddingLeft: '48px', fontStyle: 'italic' }}>
                                        "{e.example}"
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div>
                            {pos && <span style={{ fontSize: '0.875rem', color: '#7C3AED', fontWeight: 600, marginRight: '8px' }}>{pos}</span>}
                            <p className="font-khmer" style={{ fontSize: '1.125rem', color: '#3F3F46', lineHeight: '1.7', display: 'inline' }}>{definition}</p>
                        </div>
                    )}
                </div>
            )}

            {/* IPA */}
            {ipa && (
                <p style={{ fontSize: '0.875rem', color: '#A1A1AA', marginTop: '8px' }}>
                    IPA: <span style={{ color: '#71717A', fontWeight: 500 }}>{ipa}</span>
                </p>
            )}

            {/* Suggestions */}
            {!isCorrect && suggestions && suggestions.length > 1 && (
                <details style={{ marginTop: '16px' }}>
                    <summary style={{ fontSize: '0.875rem', color: '#A1A1AA', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {suggestions.length - 1} other suggestion{suggestions.length - 1 > 1 ? 's' : ''}
                    </summary>
                    <div style={{ marginTop: '12px', paddingLeft: '14px', borderLeft: '2px solid #F5F5F5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {suggestions.slice(1).map((s, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                    <span className="font-khmer" style={{ color: '#18181B', fontWeight: 600, fontSize: '1.125rem' }}>{s.word}</span>
                                    <span style={{ fontSize: '0.875rem', color: '#A1A1AA' }}>{Math.round(s.score * 100)}% Match</span>
                                </div>
                                {s.allEntries ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {s.allEntries.slice(0, 2).map((e, ei) => (
                                            <p key={ei} className="font-khmer" style={{ fontSize: '0.875rem', color: '#71717A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {e.pos && <span style={{ color: '#7C3AED', fontWeight: 600, marginRight: '4px' }}>{e.pos}</span>}
                                                {e.definition}
                                            </p>
                                        ))}
                                        {s.allEntries.length > 2 && <p style={{ fontSize: '0.75rem', color: '#A1A1AA', margin: 0 }}>+{s.allEntries.length - 2} more definitions</p>}
                                    </div>
                                ) : s.definition && (
                                    <p className="font-khmer" style={{ fontSize: '0.75rem', color: '#71717A', margin: 0 }}>
                                        {pos && <span style={{ color: '#7C3AED', fontWeight: 600, marginRight: '4px' }}>{pos}</span>}
                                        {s.definition}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}

export default function ResultsPanel({ results }) {
    if (!results) {
        return (
            <div className="card animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center', background: '#FAFAFA', borderStyle: 'dashed' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.3 }}>🇰🇭</div>
                <h3 style={{ fontSize: '1.125rem', color: '#71717A', fontWeight: 500 }}>
                    Enter Khmer text above to begin analysis
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#A1A1AA', marginTop: '8px' }}>
                    We'll check spelling, segmentation, and provide pronunciations.
                </p>
            </div>
        );
    }

    const { correctedText, isAllCorrect, words, ocrText, ocrConfidence } = results;

    return (
        <div className="animate-fade-in" style={{ textAlign: 'left' }}>

            {/* Status card */}
            <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isAllCorrect ? '#DCFCE7' : '#FEF3C7',
                        color: isAllCorrect ? '#16A34A' : '#D97706',
                        fontSize: '1.125rem'
                    }}>
                        {isAllCorrect ? '✓' : '✎'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#18181B' }}>
                            {isAllCorrect ? 'All words are correct' : 'Corrections found'}
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#A1A1AA', marginTop: '2px' }}>
                            {words.length} word{words.length !== 1 ? 's' : ''} analyzed
                        </p>
                    </div>
                </div>

                {/* Corrected text */}
                <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '16px' }}>
                    <p style={{ fontSize: '0.875rem', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: 600 }}>
                        Corrected Text
                    </p>
                    <p className="font-khmer" style={{ fontSize: '1.5rem', color: '#18181B', lineHeight: '1.8' }}>
                        {correctedText}
                    </p>
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E5E5E5' }}>
                        <AudioPlayer text={correctedText} />
                    </div>
                </div>

                {/* OCR info */}
                {ocrText && (
                    <div style={{ marginTop: '16px', background: '#FAFAFA', borderRadius: '12px', padding: '14px' }}>
                        <p style={{ fontSize: '0.6875rem', color: '#A1A1AA', marginBottom: '6px' }}>
                            OCR extracted · {ocrConfidence}% confidence
                        </p>
                        <p className="font-khmer" style={{ fontSize: '0.8125rem', color: '#52525B' }}>{ocrText}</p>
                    </div>
                )}
            </div>

            {/* Word-by-word analysis */}
            <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                    Word-by-Word Analysis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {words.map((word, i) => (
                        <WordCard key={i} result={word} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
