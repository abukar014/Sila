export default function SiteFooter() {
  const col = (title: string, items: string[]) => (
    <div>
      <div style={{
        fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--ink-mute)', marginBottom: 14,
      }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        {items.map(i => (
          <li key={i}>
            <a href="#" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: 13.5 }}>
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      marginTop: 80, padding: '40px 40px 60px',
      color: 'var(--ink-mute)', fontSize: 13,
    }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48,
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.02em',
          }}>
            Sila
          </span>
          <p style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 16, marginTop: 16,
            color: 'var(--ink-2)', maxWidth: 360, lineHeight: 1.5,
          }}>
            A verified directory for licensed mental health and medical professionals.
          </p>
        </div>
        {col('Find care', ['Therapists', 'Psychiatrists', 'Couples', 'Specialty search'])}
        {col('For providers', ['Apply', 'How credentialing works', 'Pricing', 'Provider stories'])}
        {col('Sila', ['About', 'Standards of verification', 'Press', 'Contact'])}
      </div>

      <div style={{
        maxWidth: 1320, margin: '48px auto 0', paddingTop: 24,
        borderTop: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--ink-faint)',
      }}>
        <span>© 2026 Sila Health, PBC.</span>
        <span>Sila does not provide medical advice, diagnosis, or treatment.</span>
      </div>
    </footer>
  );
}
