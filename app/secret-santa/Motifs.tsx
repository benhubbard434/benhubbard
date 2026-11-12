/** The eight-pointed star from Nordic knitwear, drawn as eight rhombi. */
export function Star({ size = 56 }: { size?: number }) {
  const petal = "M0 0 L9 -9 L0 -30 L-9 -9 Z";
  return (
    <svg className="santa-star" width={size} height={size} viewBox="-34 -34 68 68" aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path key={angle} d={petal} transform={`rotate(${angle})`} />
      ))}
    </svg>
  );
}

/** A small fir made of three stacked triangles. */
export function Fir({ size = 40 }: { size?: number }) {
  return (
    <svg className="santa-fir" width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden="true">
      <path d="M20 2 L30 16 H10 Z M20 11 L34 29 H6 Z M20 22 L38 43 H2 Z" />
      <rect x="18" y="43" width="4" height="6" />
    </svg>
  );
}
