import type { CSSProperties, ReactNode } from 'react';

export interface ShowcaseContainerProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

/**
 * Preset animation timing and starting offset variations to desynchronize
 * multiple showcase containers across the landing page.
 * Durations span 19s to 25s with non-overlapping negative delays for organic wander.
 */
const DRIFT_PRESETS = [
  { duration: '18s', delay: '-2s', direction: 'cw' },
  { duration: '22s', delay: '-7s', direction: 'ccw' },
  { duration: '19s', delay: '-13s', direction: 'cw' },
  { duration: '24s', delay: '-5s', direction: 'ccw' },
  { duration: '20s', delay: '-10s', direction: 'cw' },
  { duration: '23s', delay: '-16s', direction: 'ccw' },
  { duration: '21s', delay: '-4s', direction: 'cw' },
];

/**
 * ShowcaseContainer displays product previews inside a generous, softly
 * gradient-tinted rectangular frame inspired by modern fintech design (Mercury style).
 * Features an organic, continuously drifting gradient background composed of warm
 * off-white, light beige, and pale sage green that slowly moves in multiple directions.
 * Inner product cards remain completely stationary on a higher stacking context.
 */
export function ShowcaseContainer({
  children,
  className = '',
  index = 0,
}: ShowcaseContainerProps) {
  const preset = DRIFT_PRESETS[Math.abs(index) % DRIFT_PRESETS.length];

  const customStyle: CSSProperties = {
    '--showcase-duration': preset.duration,
    '--showcase-delay': preset.delay,
  } as CSSProperties;

  const flowClass = preset.direction === 'cw' ? 'showcase-flow-cw' : 'showcase-flow-ccw';

  return (
    <div
      style={customStyle}
      className={`rounded-2xl border border-[#DDD9D0] p-4 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden bg-[#F4F1EA] ${className}`}
    >
      {/* ── Background Wrapper (Guaranteed 100% coverage, isolated from any spacing rules) ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden !m-0 !p-0">
        {/* ── Primary Animated Wandering Gradient (Multi-directional organic flow) ── */}
        <div
          className={`absolute inset-0 w-full h-full ${flowClass}`}
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 20% 25%, rgba(255, 255, 255, 0.72) 0%, transparent 60%), ' +
              'linear-gradient(-45deg, #F6F3EC 0%, #BFE0CA 20%, #F3E4CD 40%, #C8E8D5 60%, #EBDDC4 80%, #F6F3EC 100%)',
          }}
        />

        {/* ── Secondary Subtle Floating Mist Layer (Depth & gentle tonal variation) ── */}
        <div
          className="absolute inset-[-20%] showcase-cloud-drift opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 75% 70%, rgba(195, 228, 208, 0.55) 0%, transparent 65%), ' +
              'radial-gradient(ellipse 50% 45% at 25% 75%, rgba(240, 226, 206, 0.5) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* ── Inner Product Content: Guaranteed Completely Stationary ── */}
      <div className="relative z-10 !m-0">
        {children}
      </div>
    </div>
  );
}
