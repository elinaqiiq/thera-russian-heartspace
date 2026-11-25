import type { CSSProperties } from "react";

const petals = [
  // Start (%), size (px), fall duration (s), elapsed time (s), drift (px), tilt (deg).
  [7, 28, 20, 7, -25, -28],
  [22, 22, 24, 15, 37, 16],
  [35, 18, 19, 6, -34, -9],
  [48, 26, 25, 14, -13, 32],
  [83, 19, 21, 6, 25, -21],
  [92, 24, 23, 11, -50, 22],
  [14, 16, 23, 20, 39, 9],
  [42, 21, 26, 12, -44, -36],
  [87, 17, 21, 17, 36, 31],
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
        {petals.map(([start, size, duration, elapsed, drift, tilt]) => (
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
                "--petal-tilt": `${tilt}deg`,
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
