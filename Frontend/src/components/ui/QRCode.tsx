const N = 25

// Deterministic on/off grid built from a seed string. Pure module-level helper so the
// pseudo-random state lives outside of render (not a scannable QR — decorative only).
function buildModules(value: string): boolean[][] {
  let seed = 7
  for (const ch of value) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }

  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7)

  const grid: boolean[][] = []
  for (let r = 0; r < N; r++) {
    const row: boolean[] = []
    for (let c = 0; c < N; c++) row.push(!inFinder(r, c) && rand() > 0.55)
    grid.push(row)
  }
  return grid
}

function Finder({ x, y, cell }: { x: number; y: number; cell: number }) {
  return (
    <g transform={`translate(${x * cell}, ${y * cell})`}>
      <rect width={cell * 7} height={cell * 7} rx={cell} />
      <rect x={cell} y={cell} width={cell * 5} height={cell * 5} rx={cell * 0.6} fill="white" />
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} rx={cell * 0.4} />
    </g>
  )
}

/** A deterministic, QR-styled placeholder (not a scannable code) generated from a seed string. */
export function QRCode({ value, size = 132 }: { value: string; size?: number }) {
  const cell = size / N
  const grid = buildModules(value)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-ink" fill="currentColor" role="img" aria-label="Booking QR code">
      <rect width={size} height={size} fill="white" />
      {grid.flatMap((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} rx={cell * 0.15} /> : null,
        ),
      )}
      <Finder x={0} y={0} cell={cell} />
      <Finder x={N - 7} y={0} cell={cell} />
      <Finder x={0} y={N - 7} cell={cell} />
    </svg>
  )
}
