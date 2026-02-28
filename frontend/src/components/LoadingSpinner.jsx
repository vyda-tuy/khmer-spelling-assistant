import { useState, useEffect } from 'react';

const LOADING_STEPS = [
    { label: 'Tokenizing text...', icon: '🔤', delay: 0 },
    { label: 'Checking dictionary...', icon: '📖', delay: 800 },
    { label: 'Running AI analysis...', icon: '🤖', delay: 2200 },
    { label: 'Building results...', icon: '✨', delay: 4000 },
];

export default function LoadingSpinner({ message = 'Processing...' }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const timers = LOADING_STEPS.map((step, i) =>
            setTimeout(() => setCurrentStep(i), step.delay)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '16px' }}
            className="animate-fade-in">
            <div className="spinner" />

            {/* Step indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                {LOADING_STEPS.map((step, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            opacity: i <= currentStep ? 1 : 0.3,
                            transition: 'opacity 0.3s ease',
                            fontSize: '0.8125rem',
                            color: i < currentStep ? '#16A34A' : i === currentStep ? '#18181B' : '#A1A1AA',
                            fontWeight: i === currentStep ? 600 : 400
                        }}
                    >
                        <span style={{ width: '20px', textAlign: 'center' }}>
                            {i < currentStep ? '✓' : step.icon}
                        </span>
                        <span>{step.label}</span>
                        {i === currentStep && (
                            <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px', marginLeft: 'auto' }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
