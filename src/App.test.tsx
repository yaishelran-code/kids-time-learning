import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App';
import { AnalogClock } from './components/AnalogClock';

describe('initial Home screen', () => {
  it('renders Hebrew welcome, learning entry, and a parent placeholder', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('לומדים את השעה');
    expect(html).toContain('שלום!');
    expect(html).toContain('type="button"');
    expect(html).toContain('התחל ללמוד');
    expect(html).toContain('אזור הורים');
    expect(html).toContain('בקרוב');
  });

  it('shows seven in a left-to-right digital display', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toMatch(/dir="ltr"[^>]*>7:00<\/p>/);
    expect(html).not.toContain('19:00');
  });
});

describe('AnalogClock', () => {
  it('renders a labelled SVG with all twelve hour numbers', () => {
    const html = renderToStaticMarkup(<AnalogClock />);
    expect(html).toContain('role="img"');
    expect(html).toContain('שעון אנלוגי המציג את השעה שבע');
    for (let hour = 1; hour <= 12; hour++) expect(html).toContain(`>${hour}</text>`);
  });

  it('points the short hand at seven and the long hand at twelve', () => {
    const html = renderToStaticMarkup(<AnalogClock />);
    expect(html).toMatch(/data-hand="hour"[^>]*y2="78"[^>]*rotate\(210 150 150\)/);
    expect(html).toMatch(/data-hand="minute"[^>]*x1="150" y1="150" x2="150" y2="60"/);
  });
});
