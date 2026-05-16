// Sidequest — static parallax world background
// A platformer-vibe scene that lives BEHIND the entire horizontal track.
// Three depth layers: far mountains, mid hills + clouds, fore ground.
// All layers are positioned via translate3d driven by currentRef (the same
// ref the scroll engine uses), so they pan at different rates relative to
// the foreground panels — creating depth without re-rendering.

function World({ currentRef, totalWidth }) {
  // refs for each parallax layer
  const skyRef   = React.useRef(null);  // moves at 0.05x — almost still, just the gradient
  const sunRef   = React.useRef(null);  // 0.08x — distant sun glow
  const farRef   = React.useRef(null);  // 0.18x — distant mountain silhouettes
  const cloudRef = React.useRef(null);  // 0.30x — clouds
  const midRef   = React.useRef(null);  // 0.45x — mid hills
  const treeRef  = React.useRef(null);  // 0.65x — tree silhouettes
  const groundRef= React.useRef(null);  // 0.85x — foreground ground line + grass tufts
  const birdRef  = React.useRef(null);  // animated independently

  React.useEffect(() => {
    let raf;
    const tick = () => {
      const x = currentRef.current || 0;
      const apply = (ref, factor) => {
        if (ref.current) ref.current.style.transform = `translate3d(${-x * factor}px, 0, 0)`;
      };
      apply(skyRef,    0.02);
      apply(sunRef,    0.06);
      apply(farRef,    0.18);
      apply(cloudRef,  0.30);
      apply(midRef,    0.45);
      apply(treeRef,   0.65);
      apply(groundRef, 0.85);
      // birds — drift independently, looping across viewport
      if (birdRef.current) {
        const t = performance.now() * 0.04;
        birdRef.current.style.transform = `translate3d(${-x * 0.25 + (t % 2400)}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentRef]);

  // World is wider than the track to give parallax breathing room.
  const W = Math.max(totalWidth, 12000);

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', zIndex: 0,
    }}>
      {/* SKY — base gradient, basically static, sits behind everything */}
      <div ref={skyRef} style={{
        position: 'absolute', top: 0, left: 0, width: W, height: '100%',
        background: `linear-gradient(180deg,
          #06040b 0%,
          #0d081a 25%,
          #1a0f2e 55%,
          #2d1654 78%,
          #4a2378 92%,
          #5d2a8e 100%)`,
      }}/>

      {/* SUN — soft violet glow disk, low on the horizon */}
      <div ref={sunRef} style={{
        position: 'absolute', top: 0, left: 0, width: W, height: '100%',
      }}>
        {/* one sun every ~2 viewports so it's still visible no matter where you are */}
        {Array.from({ length: Math.ceil(W / 1800) + 1 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 600 + i * 1800,
            bottom: '34%',
            width: 280, height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,181,253,0.55) 0%, rgba(124,58,237,0.25) 40%, transparent 70%)',
            filter: 'blur(2px)',
          }}/>
        ))}
      </div>

      {/* STARS — sprinkled across the sky band */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '40%',
        opacity: 0.6,
      }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {Array.from({ length: 80 }).map((_, i) => {
            const x = (i * 137) % 100;
            const y = ((i * 71) % 100);
            const r = (i % 3 === 0) ? 1.2 : 0.6;
            return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#c4b5fd"/>;
          })}
        </svg>
      </div>

      {/* FAR MOUNTAINS — distant range, deep violet */}
      <div ref={farRef} style={{
        position: 'absolute', top: 0, left: 0, width: W, height: '100%',
      }}>
        <FarMountains width={W}/>
      </div>

      {/* CLOUDS */}
      <div ref={cloudRef} style={{
        position: 'absolute', top: 0, left: 0, width: W, height: '100%',
      }}>
        <Clouds width={W}/>
      </div>

      {/* MID HILLS — closer range, more violet, layered */}
      <div ref={midRef} style={{
        position: 'absolute', top: 0, left: 0, width: W, height: '100%',
      }}>
        <MidHills width={W}/>
      </div>

      {/* TREE SILHOUETTES — sparse */}
      <div ref={treeRef} style={{
        position: 'absolute', top: 0, left: 0, width: W, height: '100%',
      }}>
        <Trees width={W}/>
      </div>

      {/* GROUND — foreground line + grass tufts */}
      <div ref={groundRef} style={{
        position: 'absolute', top: 0, left: 0, width: W, height: '100%',
      }}>
        <Ground width={W}/>
      </div>

      {/* BIRDS — animated drift */}
      <div ref={birdRef} style={{
        position: 'absolute', top: '18%', left: 0,
        width: 60, height: 20,
      }}>
        <BirdFlock/>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// FAR MOUNTAINS — gentle range, dark
// ──────────────────────────────────────────────────────────
function FarMountains({ width }) {
  // build a path that tiles a soft mountain silhouette
  const baseY = 600;          // peaks vertical position from top of svg viewport
  const peakHeights = [110, 140, 80, 160, 120, 95, 135, 175, 100, 125, 150, 90, 145, 115];
  const peakWidth = 700;
  const total = Math.ceil(width / peakWidth) + 2;
  let d = `M0,${baseY + 200}`;
  for (let i = 0; i < total; i++) {
    const h = peakHeights[i % peakHeights.length];
    const x1 = i * peakWidth + peakWidth * 0.5;
    const x2 = (i + 1) * peakWidth;
    d += ` Q${x1},${baseY - h} ${x2},${baseY}`;
  }
  d += ` L${width + peakWidth * 2},1080 L0,1080 Z`;
  return (
    <svg style={{ position: 'absolute', bottom: 0, left: 0, height: '100%' }}
         width={width} viewBox={`0 0 ${width} 1080`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="far-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a1d6e" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#1a0f2e" stopOpacity="1"/>
        </linearGradient>
      </defs>
      <path d={d} fill="url(#far-grad)"/>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// MID HILLS — closer, slightly lighter
// ──────────────────────────────────────────────────────────
function MidHills({ width }) {
  const baseY = 780;
  const peakHeights = [70, 90, 55, 110, 75, 95, 60, 100, 85, 65];
  const peakWidth = 480;
  const total = Math.ceil(width / peakWidth) + 2;
  let d = `M0,${baseY + 200}`;
  for (let i = 0; i < total; i++) {
    const h = peakHeights[i % peakHeights.length];
    const x1 = i * peakWidth + peakWidth * 0.5;
    const x2 = (i + 1) * peakWidth;
    d += ` Q${x1},${baseY - h} ${x2},${baseY}`;
  }
  d += ` L${width + peakWidth * 2},1080 L0,1080 Z`;
  return (
    <svg style={{ position: 'absolute', bottom: 0, left: 0, height: '100%' }}
         width={width} viewBox={`0 0 ${width} 1080`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="mid-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5d2a8e" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#2a1351" stopOpacity="1"/>
        </linearGradient>
      </defs>
      <path d={d} fill="url(#mid-grad)"/>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// CLOUDS — soft horizontal puffs
// ──────────────────────────────────────────────────────────
function Clouds({ width }) {
  // deterministic "random" placement by index
  const clouds = [];
  const stride = 600;
  const count = Math.ceil(width / stride) + 2;
  for (let i = 0; i < count; i++) {
    const seed = i * 73;
    const x = i * stride + (seed % 200);
    const y = 80 + ((seed * 31) % 220);  // sky band only
    const w = 140 + (seed % 120);
    const o = 0.18 + ((seed % 100) / 100) * 0.22;
    clouds.push({ x, y, w, o, key: i });
  }
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width, height: '100%' }}
         viewBox={`0 0 ${width} 1080`} preserveAspectRatio="none">
      {clouds.map(({ x, y, w, o, key }) => (
        <g key={key} opacity={o}>
          <ellipse cx={x}     cy={y}      rx={w * 0.5} ry={w * 0.16} fill="#c4b5fd"/>
          <ellipse cx={x + w * 0.25} cy={y - 6} rx={w * 0.32} ry={w * 0.13} fill="#c4b5fd"/>
          <ellipse cx={x - w * 0.2} cy={y + 4} rx={w * 0.28} ry={w * 0.11} fill="#c4b5fd"/>
        </g>
      ))}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// TREES — sparse silhouettes
// ──────────────────────────────────────────────────────────
function Trees({ width }) {
  const trees = [];
  const stride = 280;
  const count = Math.ceil(width / stride) + 2;
  for (let i = 0; i < count; i++) {
    // skip ~2/3 of slots so trees feel sparse
    if (i % 3 !== 0 && i % 5 !== 0) continue;
    const seed = i * 89;
    const x = i * stride + (seed % 80);
    const baseY = 880;
    const h = 60 + (seed % 60);
    trees.push({ x, y: baseY, h, key: i, kind: i % 7 === 0 ? 'wide' : 'tall' });
  }
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width, height: '100%' }}
         viewBox={`0 0 ${width} 1080`} preserveAspectRatio="none">
      {trees.map(({ x, y, h, key, kind }) => kind === 'tall' ? (
        // pine
        <g key={key}>
          <rect x={x - 2} y={y} width={4} height={20} fill="#0a0612"/>
          <polygon points={`${x},${y - h} ${x - h * 0.35},${y} ${x + h * 0.35},${y}`} fill="#0a0612"/>
        </g>
      ) : (
        // round
        <g key={key}>
          <rect x={x - 2} y={y} width={4} height={20} fill="#0a0612"/>
          <ellipse cx={x} cy={y - h * 0.5} rx={h * 0.4} ry={h * 0.5} fill="#0a0612"/>
        </g>
      ))}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// GROUND — foreground earth band + grass tufts
// ──────────────────────────────────────────────────────────
function Ground({ width }) {
  const tufts = [];
  for (let i = 0; i < Math.ceil(width / 60); i++) {
    const seed = i * 41;
    const x = i * 60 + (seed % 30);
    if (seed % 3 === 0) tufts.push({ x, key: i });
  }
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width, height: '100%' }}
         viewBox={`0 0 ${width} 1080`} preserveAspectRatio="none">
      {/* earth band */}
      <rect x="0" y="900" width={width} height="180" fill="#06040b"/>
      {/* top edge of ground — subtle violet line */}
      <rect x="0" y="899" width={width} height="1.5" fill="rgba(196,181,253,0.35)"/>
      {/* grass tufts as tiny strokes */}
      {tufts.map(({ x, key }) => (
        <g key={key} stroke="rgba(196,181,253,0.5)" strokeWidth="1" strokeLinecap="round">
          <line x1={x} y1="898" x2={x - 2} y2="892"/>
          <line x1={x + 1} y1="898" x2={x + 1} y2="890"/>
          <line x1={x + 3} y1="898" x2={x + 4} y2="893"/>
        </g>
      ))}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// BIRDS — small flock of M-shapes drifting
// ──────────────────────────────────────────────────────────
function BirdFlock() {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40">
      <g stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 18 L11 14 L17 18"/>
        <path d="M30 22 L35 18 L40 22"/>
        <path d="M55 16 L60 12 L65 16"/>
        <path d="M85 24 L89 20 L93 24"/>
      </g>
    </svg>
  );
}

Object.assign(window, { World });
