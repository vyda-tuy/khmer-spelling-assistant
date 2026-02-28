/**
 * Header — minimal, clean branding
 */
export default function Header({ stats }) {
    return (
        <header style={{ paddingTop: '48px', paddingBottom: '40px' }}>
            {/* Khmer title */}
            <h1 className="font-khmer" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#18181B', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                ជំនួយការអក្ខរាវិរុទ្ធខ្មែរ
            </h1>

            {/* English subtitle */}
            <p style={{ fontSize: '1rem', color: '#A1A1AA', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Khmer Spelling Assistant
            </p>

            {/* Metadata line */}
            <p style={{ marginTop: '16px', fontSize: '1rem', color: '#A1A1AA' }}>
                {stats?.dictionarySize?.toLocaleString() || '44,706'} dictionary entries
                {stats?.aiAvailable && ' · AI enabled'}
            </p>
        </header>
    );
}
