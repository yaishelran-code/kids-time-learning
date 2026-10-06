import { AnalogClock } from './components/AnalogClock';

export function App() {
  return (
    <main className="home">
      <header>
        <p className="eyebrow">מגלים את הזמן ביחד</p>
        <h1>לומדים את השעה</h1>
        <p className="welcome">שלום! איזה כיף שבאתם. בואו נכיר את השעון!</p>
      </header>
      <section className="clock-card" id="clock" aria-label="מכירים את השעון" tabIndex={-1}>
        <AnalogClock />
        <p className="digital-time" dir="ltr" aria-label="השעה שבע">7:00</p>
        <p className="clock-caption">השעה שבע</p>
      </section>
      <button className="start-button" type="button" onClick={() => {
        const clock = document.getElementById('clock');
        clock?.focus({ preventScroll: true });
        clock?.scrollIntoView({ block: 'center' });
      }}>התחל ללמוד</button>
      <p className="parent-placeholder">אזור הורים <span>— בקרוב</span></p>
    </main>
  );
}
