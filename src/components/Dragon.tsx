/** Original placeholder dragon from simple shapes; it does not imitate any book or film art. */
export function Dragon({
  stage = 1,
  mood = 'happy',
  label,
  size = 120,
}: {
  stage?: number;
  mood?: 'happy' | 'think' | 'sleep';
  label: string;
  size?: number;
}) {
  const scale = 0.7 + stage * 0.06;
  return (
    <svg
      className={`dragon dragon-${mood}`}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <g transform={`translate(60 66) scale(${scale}) translate(-60 -66)`}>
        <path d="M84 84 Q108 92 104 70 Q100 82 86 76 Z" fill="#2f8f5b" />
        <path d="M30 56 L10 36 L36 46 Z M90 56 L110 36 L84 46 Z" fill="#3fae6f" />
        <ellipse cx="60" cy="72" rx="32" ry="28" fill="#3fae6f" />
        <ellipse cx="60" cy="80" rx="18" ry="14" fill="#a8e0b5" />
        <path d="M44 42 L40 28 L50 40 Z M76 42 L80 28 L70 40 Z" fill="#2f8f5b" />
        <circle cx="60" cy="50" r="22" fill="#3fae6f" />
        {mood === 'sleep' ? (
          <>
            <path
              d="M46 50 Q51 54 56 50 M64 50 Q69 54 74 50"
              stroke="#0f2a2e"
              strokeWidth="2.5"
              fill="none"
            />
            <text x="88" y="30" fontSize="12" fill="#f4e04d">
              z
            </text>
            <text x="96" y="20" fontSize="9" fill="#f4e04d">
              z
            </text>
          </>
        ) : (
          <>
            <circle cx="51" cy="48" r="7" fill="#f4e04d" />
            <circle cx="69" cy="48" r="7" fill="#f4e04d" />
            <circle
              cx={mood === 'think' ? 53 : 51}
              cy={mood === 'think' ? 46 : 49}
              r="3.2"
              fill="#0f2a2e"
            />
            <circle
              cx={mood === 'think' ? 71 : 69}
              cy={mood === 'think' ? 46 : 49}
              r="3.2"
              fill="#0f2a2e"
            />
          </>
        )}
        <path d="M52 61 Q60 66 68 61" stroke="#0f2a2e" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}
