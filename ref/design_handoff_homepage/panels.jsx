// Sidequest — panels (hero / 4 projects / index / contact)
// Stripped back ~80%. Each panel sits transparently on top of the World
// background. One eyebrow, one headline, optional one-line context. That's it.

const PANEL_H = '100vh';

// ──────────────────────────────────────────────────────────
// shared atoms
// ──────────────────────────────────────────────────────────
function Eyebrow({ children, color = COLORS.violetLt }) {
  return (
    <div style={{
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
      color, display: 'inline-flex', gap: 14, alignItems: 'center',
    }}>{children}</div>
  );
}
function Tick() {
  return <span style={{ display: 'inline-block', width: 24, height: 1, background: 'currentColor' }}/>;
}
function ScrollArrow() {
  return (
    <svg width="60" height="10" viewBox="0 0 60 10">
      <path d="M0 5 L52 5 M46 1 L52 5 L46 9" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  );
}

// shared headline style — keeps every panel in the same type voice
const headlineStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: 500,
  lineHeight: 0.95,
  letterSpacing: '-0.04em',
  color: COLORS.ink,
  margin: 0,
  textShadow: '0 4px 40px rgba(0,0,0,0.6)',
};

// soft local backdrop so type stays legible against the world.
// covers just the type's own footprint, not the whole panel.
function TypeBackdrop({ children, align = 'left' }) {
  const justify = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
  return (
    <div style={{
      position: 'relative', height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: justify, padding: '0 80px',
    }}>{children}</div>
  );
}

// ──────────────────────────────────────────────────────────
// HERO — name + tagline. that's it.
// ──────────────────────────────────────────────────────────
function HeroPanel() {
  return (
    <section data-panel style={{
      width: '100vw', height: PANEL_H, flexShrink: 0,
      position: 'relative',
    }}>
      <TypeBackdrop>
        <div style={{ maxWidth: 880 }}>
          <Eyebrow><Tick/> SIDEQUEST · CHRISTCHURCH</Eyebrow>
          <h1 style={{
            ...headlineStyle,
            fontSize: 'clamp(72px, 9vw, 152px)',
            lineHeight: 0.92,
            letterSpacing: '-0.045em',
            marginTop: 32,
          }}>
            Be <span style={{ color: COLORS.violetLt, fontStyle: 'italic', fontWeight: 400 }}>Known.</span><br/>
            Stand <span style={{ color: COLORS.ink2 }}>Out.</span>
          </h1>
          <div style={{
            marginTop: 40,
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: COLORS.ink3,
            display: 'inline-flex', gap: 16, alignItems: 'center',
          }}>
            <span>SCROLL</span>
            <ScrollArrow/>
            <span>FOUR RECENT WORKS</span>
          </div>
        </div>
      </TypeBackdrop>
    </section>
  );
}

// ──────────────────────────────────────────────────────────
// PROJECT PANELS — same shape, different content.
// One eyebrow (number + sector), one headline, one micro-line.
// ──────────────────────────────────────────────────────────
function ProjectPanel({ idx, sector, headline, sub, year, image, imageAlt, align = 'left' }) {
  // image side is the OPPOSITE of the text alignment
  const imageOnRight = align === 'left';
  return (
    <section data-panel style={{
      width: '100vw', height: PANEL_H, flexShrink: 0,
      position: 'relative',
    }}>
      <div style={{
        position: 'relative', height: '100%',
        display: 'grid',
        gridTemplateColumns: imageOnRight ? '1fr 1fr' : '1fr 1fr',
        alignItems: 'center', padding: '0 80px', gap: 60,
      }}>
        {/* TEXT */}
        <div style={{
          gridColumn: imageOnRight ? 1 : 2,
          textAlign: align,
          justifySelf: align === 'right' ? 'end' : 'start',
          maxWidth: 560,
        }}>
          <Eyebrow>
            <span style={{ color: COLORS.violetLt }}>QUEST {String(idx).padStart(2, '0')} / 04</span>
            <Tick/>
            <span>{sector}</span>
          </Eyebrow>
          <h2 style={{
            ...headlineStyle,
            fontSize: 'clamp(34px, 3.6vw, 62px)',
            marginTop: 24,
          }}>
            {headline}
          </h2>
          <div style={{
            marginTop: 24,
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: COLORS.ink3,
          }}>
            {sub} <span style={{ color: COLORS.ink4 }}>·</span> <span style={{ color: COLORS.ink2 }}>{year}</span>
          </div>
        </div>

        {/* IMAGE */}
        <div style={{
          gridColumn: imageOnRight ? 2 : 1,
          justifySelf: imageOnRight ? 'end' : 'start',
        }}>
          <ProjectImage src={image} alt={imageAlt}/>
        </div>
      </div>
    </section>
  );
}

function ProjectImage({ src, alt }) {
  return (
    <div style={{
      width: 'min(420px, 32vw)',
      aspectRatio: '4/5',
      position: 'relative',
      marginBottom: '18vh',
      boxShadow: `0 60px 140px -40px rgba(0,0,0,0.7), 0 0 0 1px ${COLORS.lineMid}`,
      overflow: 'hidden',
      background: COLORS.bg2,
    }}>
      <img src={src} alt={alt} style={{
        width: '100%', height: '100%', objectFit: 'cover',
        filter: 'saturate(0.85) contrast(1.05)',
      }}/>
      {/* subtle violet vignette so photos feel part of the world without crushing them */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(124,58,237,0.18) 0%, transparent 35%, rgba(8,6,13,0.45) 100%)',
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

function Project01() {
  return (
    <ProjectPanel
      idx={1} sector="EDUCATION" year="2025"
      sub="Maungatua College · learning portal"
      image="https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1200&q=80"
      imageAlt="School corridor"
      headline={<>
        Twelve logins,<br/>
        <span style={{ color: COLORS.violetLt, fontStyle: 'italic', fontWeight: 400 }}>one door.</span>
      </>}
    />
  );
}

function Project02() {
  return (
    <ProjectPanel
      idx={2} sector="COMMUNITY" year="2025" align="right"
      sub="Coast Pony Club · member directory"
      image="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=80"
      imageAlt="Pony in field"
      headline={<>
        A spreadsheet,<br/>
        finally <span style={{ color: COLORS.violetLt, fontStyle: 'italic', fontWeight: 400 }}>retired.</span>
      </>}
    />
  );
}

function Project03() {
  return (
    <ProjectPanel
      idx={3} sector="ARTS" year="2025"
      sub="Selwyn Choristers · rehearsal scheduler"
      image="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&q=80"
      imageAlt="Choir performing"
      headline={<>
        A schedule that<br/>
        <span style={{ color: COLORS.violetLt, fontStyle: 'italic', fontWeight: 400 }}>actually fits.</span>
      </>}
    />
  );
}

function Project04() {
  return (
    <ProjectPanel
      idx={4} sector="SELF" year="2026" align="right"
      sub="joel.tempero.nz · the studio's own site"
      image="https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1200&q=80"
      imageAlt="Designer at desk"
      headline={<>
        The hardest brief<br/>
        was <span style={{ color: COLORS.violetLt, fontStyle: 'italic', fontWeight: 400 }}>my own.</span>
      </>}
    />
  );
}

// ──────────────────────────────────────────────────────────
// SEE MORE — bridge to back catalogue
// ──────────────────────────────────────────────────────────
function SeeMorePanel() {
  return (
    <section data-panel style={{
      width: '100vw', height: PANEL_H, flexShrink: 0,
      position: 'relative',
    }}>
      <TypeBackdrop>
        <div style={{ maxWidth: 820 }}>
          <Eyebrow><Tick/> THERE'S MORE</Eyebrow>
          <h2 style={{
            ...headlineStyle,
            fontSize: 'clamp(34px, 3.8vw, 64px)',
            marginTop: 24,
          }}>
            Twenty-six <span style={{ color: COLORS.violetLt, fontStyle: 'italic', fontWeight: 400 }}>more quests</span> in the back catalogue.
          </h2>
          <div style={{ marginTop: 36, display: 'flex', gap: 12 }}>
            <BigLink primary>Full work index →</BigLink>
            <BigLink>Field notes →</BigLink>
          </div>
        </div>
      </TypeBackdrop>
    </section>
  );
}

function BigLink({ children, primary }) {
  return (
    <a style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      padding: '18px 28px',
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em',
      background: primary ? COLORS.violet : 'transparent',
      color: COLORS.ink,
      border: primary ? 'none' : `1px solid ${COLORS.lineMid}`,
      cursor: 'pointer',
      backdropFilter: primary ? 'none' : 'blur(4px)',
    }}>{children}</a>
  );
}

// ──────────────────────────────────────────────────────────
// LOGOS — scattered "trusted by" wall with parallax depth
// Each logo lives in 3D-ish space: depth controls scale, opacity, and how
// far it parallax-pans relative to the panel as the page scrolls past.
// ──────────────────────────────────────────────────────────
function LogosPanel({ currentRef, panelStart }) {
  // 10 logos with deterministic positioning. positions in % of panel width/height.
  // depth: 0 = far (slow, small, dim), 1 = near (fast, big, bright)
  const logos = [
    { name: 'Maungatua',           kind: 'mark', x: 8,  y: 18, depth: 0.85, rot: -3 },
    { name: 'Coast Pony Club',     kind: 'word', x: 28, y: 64, depth: 0.40, rot:  2 },
    { name: 'Selwyn Choristers',   kind: 'word', x: 52, y: 22, depth: 0.70, rot: -1 },
    { name: 'Kōwhai Lab',          kind: 'mark', x: 73, y: 58, depth: 0.95, rot:  4 },
    { name: 'Tūī & Co.',           kind: 'word', x: 18, y: 78, depth: 0.25, rot:  0 },
    { name: 'Halberg Foundation',  kind: 'word', x: 88, y: 30, depth: 0.55, rot: -2 },
    { name: 'Ōtautahi Build',      kind: 'mark', x: 40, y: 44, depth: 0.30, rot:  1 },
    { name: 'Riverbend Press',     kind: 'word', x: 62, y: 76, depth: 0.60, rot: -4 },
    { name: 'Southern Cross',      kind: 'word', x: 82, y: 80, depth: 0.50, rot:  3 },
    { name: 'Whēkau Studio',       kind: 'mark', x: 12, y: 42, depth: 0.75, rot: -2 },
  ];
  return (
    <section data-panel style={{
      width: '100vw', height: PANEL_H, flexShrink: 0,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* tiny eyebrow up top so the panel is named */}
      <div style={{
        position: 'absolute', top: '12vh', left: 80, zIndex: 5,
      }}>
        <Eyebrow><Tick/> A FEW OF THE PEOPLE I'VE BUILT FOR</Eyebrow>
      </div>

      {logos.map((l, i) => (
        <ParallaxLogo
          key={i} {...l} idx={i}
          currentRef={currentRef} panelStart={panelStart}
        />
      ))}

      <div style={{
        position: 'absolute', bottom: '14vh', right: 80, zIndex: 5,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: COLORS.ink3,
      }}>
        ─ AND TWENTY-SIX OTHERS ACROSS AOTEAROA
      </div>
    </section>
  );
}

function ParallaxLogo({ name, kind, x, y, depth, rot, idx, currentRef, panelStart }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let raf;
    // gentle independent bob, phase per index
    const bobPhase = idx * 0.7;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const t = performance.now() * 0.0008;
        const bobY = Math.sin(t + bobPhase) * (4 + (1 - depth) * 6);
        const bobX = Math.cos(t * 0.7 + bobPhase) * (3 + (1 - depth) * 5);
        // parallax horizontal — deeper logos move slower
        const localX = (currentRef.current || 0) - (panelStart || 0);
        const parX = -localX * (depth * 0.35);
        el.style.transform = `translate3d(${parX + bobX}px, ${bobY}px, 0) rotate(${rot}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentRef, panelStart, depth, rot, idx]);

  const scale = 0.7 + depth * 0.6;        // 0.7 → 1.3
  const opacity = 0.35 + depth * 0.55;    // 0.35 → 0.9

  return (
    <div ref={ref} style={{
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      willChange: 'transform',
    }}>
      <div style={{
        transform: `scale(${scale})`,
        opacity,
        filter: depth < 0.5 ? `blur(${(0.5 - depth) * 2}px)` : 'none',
      }}>
        <FakeLogo name={name} kind={kind} idx={idx}/>
      </div>
    </div>
  );
}

function FakeLogo({ name, kind, idx }) {
  // each "logo" is a small mark + wordmark, in muted ink so the wall
  // reads as a unified row rather than competing brand identities.
  const shapes = [
    // 0: square with diagonal
    <g key="s0"><rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" strokeWidth="1.5"/></g>,
    // 1: circle + dot
    <g key="s1"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/></g>,
    // 2: triangle
    <g key="s2"><polygon points="12,3 22,21 2,21" stroke="currentColor" strokeWidth="1.5" fill="none"/></g>,
    // 3: stacked bars
    <g key="s3"><rect x="3" y="4" width="18" height="3" fill="currentColor"/><rect x="3" y="11" width="12" height="3" fill="currentColor"/><rect x="3" y="18" width="18" height="3" fill="currentColor"/></g>,
    // 4: arrow
    <g key="s4"><path d="M3 12 L18 12 M14 6 L20 12 L14 18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="square"/></g>,
  ];
  const shape = shapes[idx % shapes.length];
  const fontFamily = (idx % 2 === 0) ? '"Space Grotesk", sans-serif' : '"IBM Plex Mono", monospace';
  const fontStyle  = (idx % 3 === 0) ? 'italic' : 'normal';
  const fontWeight = (idx % 2 === 0) ? 600 : 500;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      color: COLORS.ink2, opacity: 0.85,
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24">{shape}</svg>
      <span style={{
        fontFamily, fontStyle, fontWeight,
        fontSize: 15, letterSpacing: kind === 'mark' ? '0.02em' : '-0.01em',
        whiteSpace: 'nowrap',
      }}>{name}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// CONTACT — name, hi, two ways to reach me. nothing else.
// ──────────────────────────────────────────────────────────
function ContactPanel() {
  return (
    <section data-panel style={{
      width: '100vw', height: PANEL_H, flexShrink: 0,
      position: 'relative',
    }}>
      <TypeBackdrop align="right">
        <div style={{ maxWidth: 820, textAlign: 'right' }}>
          <Eyebrow><span>KIA ORA</span> <Tick/></Eyebrow>
          <h2 style={{
            ...headlineStyle,
            fontSize: 'clamp(38px, 4vw, 70px)',
            marginTop: 24,
          }}>
            I'm <span style={{ color: COLORS.violetLt, fontStyle: 'italic', fontWeight: 400 }}>Joel.</span>
            {' '}<span style={{ color: COLORS.ink3 }}>Say hi.</span>
          </h2>
          <div style={{
            marginTop: 44,
            display: 'flex', flexDirection: 'column', gap: 8,
            alignItems: 'flex-end',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em',
            color: COLORS.ink,
          }}>
            <a href="mailto:joel@tempero.nz" style={{ borderBottom: `1px solid ${COLORS.lineMid}`, paddingBottom: 4 }}>
              joel@tempero.nz
            </a>
            <a href="tel:+642040239009" style={{ color: COLORS.ink2, fontSize: 22 }}>
              +64 204 023 9009
            </a>
          </div>
        </div>
      </TypeBackdrop>
    </section>
  );
}

Object.assign(window, {
  HeroPanel, Project01, Project02, Project03, Project04,
  SeeMorePanel, LogosPanel, ContactPanel,
});
