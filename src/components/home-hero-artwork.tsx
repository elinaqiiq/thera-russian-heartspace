import type { CSSProperties } from "react";

const petals = [
  // Start (%), size (px), fall duration (s), elapsed time (s), sideways drift (px).
  [7, 11, 18, 9, -35],
  [22, 15, 22, 14, 47],
  [32, 8, 16, 5, -34],
  [44, 12, 20, 12, 62],
  [55, 9, 17, 6, -47],
  [65, 17, 24, 15, 36],
  [79, 10, 19, 6, -56],
  [91, 14, 21, 13, -52],
  [13, 7, 20, 3, 36],
  [37, 10, 22, 16, 45],
  [58, 8, 18, 10, -38],
  [74, 12, 24, 8, 56],
  [94, 9, 16, 8, -39],
] as const;

export function HomeHeroArtwork() {
  return (
    <>
      <div className="home-hero-visual" aria-hidden="true">
        <picture>
          <source
            srcSet="/thera-cat-sakura.webp"
            type="image/webp"
            media="(prefers-reduced-motion: no-preference)"
          />
          <img src="/thera-cat.webp" width={1672} height={941} alt="" fetchPriority="high" />
        </picture>
      </div>
      <div className="home-hero-petals" aria-hidden="true">
        {petals.map(([start, size, duration, elapsed, drift]) => (
          <span
            className="home-hero-petal"
            key={start}
            style={
              {
                left: `${start}%`,
                "--petal-size": `${size}px`,
                "--petal-duration": `${duration}s`,
                "--petal-delay": `-${elapsed}s`,
                "--petal-drift": `${drift}px`,
              } as CSSProperties
            }
          >
            <span />
          </span>
        ))}
      </div>
    </>
  );
}
