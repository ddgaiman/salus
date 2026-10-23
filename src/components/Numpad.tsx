import { format, ui } from '../content';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

/** On-screen number pad; children answer by tapping, never with a keyboard. */
export function Numpad({
  value,
  onChange,
  onSubmit,
  maxLength = 3,
  submitLabel = ui.game.check,
}: {
  value: string;
  onChange(value: string): void;
  onSubmit(): void;
  maxLength?: number;
  submitLabel?: string;
}) {
  return (
    <div className="numpad-wrap">
      <div className="numpad-top">
        <button
          type="button"
          className="key key-muted"
          aria-label={ui.game.delete}
          onClick={() => onChange(value.slice(0, -1))}
        >
          ⌫
        </button>
        <output className="numpad-display" aria-label={ui.game.answer} aria-live="polite">
          {value || ' '}
        </output>
        <button
          type="button"
          className="key key-go"
          aria-label={submitLabel}
          disabled={value === ''}
          onClick={onSubmit}
        >
          ✓
        </button>
      </div>
      <div className="numpad">
        {DIGITS.map((d) => (
          <button
            key={d}
            type="button"
            className="key"
            aria-label={format(ui.game.digit, { n: d })}
            onClick={() =>
              value.length < maxLength && onChange(value === '0' ? String(d) : value + d)
            }
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
