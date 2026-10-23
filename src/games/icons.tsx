export function Coin() {
  return <span className="coin" aria-hidden="true" />;
}

export function Fish() {
  return (
    <svg className="fish" viewBox="0 0 32 20" width="26" height="16" aria-hidden="true">
      <ellipse cx="13" cy="10" rx="11" ry="7" fill="#7cc6e8" />
      <path d="M22 10 L31 3 L31 17 Z" fill="#5aa9cf" />
      <circle cx="8" cy="8" r="1.8" fill="#0f2a2e" />
    </svg>
  );
}
