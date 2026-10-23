import { useGame } from '../app/GameContext';
import { ui } from '../content';

export function Speaker({ text, label = ui.game.speaker }: { text: string; label?: string }) {
  const { speak } = useGame();
  return (
    <button type="button" className="icon-btn" aria-label={label} onClick={() => speak(text)}>
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path
          d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </button>
  );
}
