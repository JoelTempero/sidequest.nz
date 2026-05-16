// Sidequest — companion robot
// A small square-bodied robot with a jet booster that flies around the screen,
// watching the mouse and following as you scroll horizontally.
// Behaviour: hovers at a "perch" offset from the cursor, springs toward target
// with damped easing, banks left/right based on velocity, jet flickers when
// accelerating. Eyes track the cursor. Occasionally blinks.

function CompanionRobot() {
  const wrapRef = React.useRef(null);
  const eyeLRef = React.useRef(null);
  const eyeRRef = React.useRef(null);
  const jetRef  = React.useRef(null);
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    // Robot has its own goals. It picks a wandering target somewhere on
    // screen, drifts toward it, and re-picks every few seconds. The mouse
    // only INFLUENCES the choice (slightly biases new targets toward where
    // the cursor is) and the robot's eyes track the cursor — but its body
    // moves on its own schedule.
    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    let posX   = window.innerWidth * 0.75;
    let posY   = window.innerHeight * 0.35;
    let velX   = 0;
    let velY   = 0;
    let targetX = posX;
    let targetY = posY;
    let nextTargetAt = performance.now() + 1500;
    let blink = 0;
    let nextBlinkAt = performance.now() + 3500 + Math.random() * 4000;

    const pickNewTarget = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      // 65% of the time wander somewhere completely random
      // 35% of the time loosely investigate near the mouse (but with big offset)
      const investigate = Math.random() < 0.35;
      if (investigate) {
        const r = 180 + Math.random() * 220;
        const a = Math.random() * Math.PI * 2;
        targetX = Math.max(80, Math.min(W - 80, mouseX + Math.cos(a) * r));
        targetY = Math.max(80, Math.min(H - 140, mouseY + Math.sin(a) * r));
      } else {
        targetX = 100 + Math.random() * (W - 200);
        // bias toward the upper 70% so it doesn't bury itself in the ground
        targetY = 80 + Math.random() * (H * 0.65);
      }
      // longer dwell when far from current pos, shorter when close
      const dist = Math.hypot(targetX - posX, targetY - posY);
      nextTargetAt = performance.now() + 1800 + Math.random() * 2600 + dist * 1.2;
    };

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const tick = () => {
      const now = performance.now();
      if (now > nextTargetAt) pickNewTarget();

      // gentle wobble on the target so even at rest it bobs
      const wobbleX = Math.sin(now * 0.0011) * 22;
      const wobbleY = Math.cos(now * 0.0016) * 18;
      const tX = targetX + wobbleX;
      const tY = targetY + wobbleY;

      // softer spring so it drifts rather than darts
      const k = 0.0035;
      const d = 0.965;
      const ax = (tX - posX) * k;
      const ay = (tY - posY) * k;
      velX = (velX + ax) * d;
      velY = (velY + ay) * d;
      // hard speed cap so it never lurches
      const maxSpeed = 3.2;
      const sp = Math.hypot(velX, velY);
      if (sp > maxSpeed) { velX = velX / sp * maxSpeed; velY = velY / sp * maxSpeed; }
      posX += velX;
      posY += velY;

      const tilt = Math.max(-18, Math.min(18, velX * 3.5));

      // eyes still track the cursor
      const dx = mouseX - posX;
      const dy = mouseY - posY;
      const dist = Math.hypot(dx, dy) || 1;
      const eyeShift = Math.min(3, dist / 60);
      const ex = (dx / dist) * eyeShift;
      const ey = (dy / dist) * eyeShift;

      if (now > nextBlinkAt) { blink = 1; nextBlinkAt = now + 3500 + Math.random() * 4500; }
      blink = Math.max(0, blink - 0.18);
      const blinkScaleY = blink > 0.5 ? 0.05 : (1 - blink * 0.4);

      const speed = Math.hypot(velX, velY);
      const jetScale = 0.6 + Math.min(1.6, speed * 0.9) + Math.sin(now * 0.04) * 0.12;
      const jetOpacity = 0.5 + Math.min(0.5, speed * 0.25);

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${posX - 36}px, ${posY - 36}px, 0)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `rotate(${tilt}deg)`;
      }
      if (eyeLRef.current) {
        eyeLRef.current.setAttribute('transform', `translate(${ex} ${ey}) scale(1 ${blinkScaleY})`);
      }
      if (eyeRRef.current) {
        eyeRRef.current.setAttribute('transform', `translate(${ex} ${ey}) scale(1 ${blinkScaleY})`);
      }
      if (jetRef.current) {
        jetRef.current.style.transform = `scaleY(${jetScale}) scaleX(${0.85 + Math.sin(now * 0.06) * 0.15})`;
        jetRef.current.style.opacity = jetOpacity;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{
      position: 'fixed', top: 0, left: 0,
      width: 72, height: 72,
      pointerEvents: 'none', zIndex: 0,
      willChange: 'transform',
    }}>
      <div ref={bodyRef} style={{
        width: '100%', height: '100%',
        transformOrigin: '50% 50%',
        willChange: 'transform',
      }}>
        <svg viewBox="0 0 72 72" width="72" height="72" overflow="visible">
          {/* JET PLUME — anchored at the nozzle (36, 54) in SVG space */}
          <g ref={jetRef} style={{ transformOrigin: '36px 54px' }}>
            <ellipse cx="36" cy="68" rx="6" ry="14" fill="rgba(196,181,253,0.85)"/>
            <ellipse cx="36" cy="66" rx="3.5" ry="9"  fill="#f5f0ff"/>
            <ellipse cx="36" cy="64" rx="1.6" ry="5"  fill="#fff"/>
          </g>

          {/* JET NOZZLE — small trapezoid attached to body bottom */}
          <path d="M30 52 L42 52 L40 56 L32 56 Z" fill="#3d3450" stroke="#7c3aed" strokeWidth="1"/>

          {/* BODY — rounded square */}
          <rect x="14" y="14" width="44" height="40" rx="9" ry="9"
                fill="#1a0f2e" stroke="#7c3aed" strokeWidth="1.5"/>

          {/* TOP ANTENNA */}
          <line x1="36" y1="14" x2="36" y2="6" stroke="#7c3aed" strokeWidth="1.5"/>
          <circle cx="36" cy="5" r="2.2" fill="#c4b5fd"/>

          {/* SCREEN / FACE PANEL */}
          <rect x="20" y="22" width="32" height="22" rx="4" ry="4" fill="#06040b"/>

          {/* EYES */}
          <g>
            <g ref={eyeLRef} style={{ transformOrigin: '28px 33px', transformBox: 'fill-box' }}>
              <circle cx="28" cy="33" r="3.2" fill="#c4b5fd"/>
            </g>
            <g ref={eyeRRef} style={{ transformOrigin: '44px 33px', transformBox: 'fill-box' }}>
              <circle cx="44" cy="33" r="3.2" fill="#c4b5fd"/>
            </g>
          </g>

          {/* MOUTH — tiny smile */}
          <path d="M30 39 Q36 42 42 39" stroke="#7c3aed" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

          {/* SIDE FINS */}
          <path d="M14 30 L8 28 L8 36 L14 38 Z" fill="#1a0f2e" stroke="#7c3aed" strokeWidth="1.2"/>
          <path d="M58 30 L64 28 L64 36 L58 38 Z" fill="#1a0f2e" stroke="#7c3aed" strokeWidth="1.2"/>

          {/* TINY STATUS LIGHT */}
          <circle cx="50" cy="48" r="1.4" fill="#c4b5fd">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { CompanionRobot });
