"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

// BP18 animation primitives — framer-motion based, machine-aesthetic safe.
// Equivalent to popular react-bits components but web-only (no react-native)
// and constrained to dark/neumorphism + prefers-reduced-motion.

/** FadeIn — entrance animation (react-bits: FadeContent / AnimatedContent) */
export function FadeIn({ children, delay = 0, y = 12 }: { children: ReactNode; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** TiltCard — 3D hover tilt (react-bits: TiltedCard / DecayCard) */
export function TiltCard({ children, className = "", amplitude = 8 }: { children: ReactNode; className?: string; amplitude?: number }) {
  const reduce = useReducedMotion();
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setRy(px * amplitude);
    setRx(-py * amplitude);
  }
  function reset() {
    setRx(0);
    setRy(0);
  }
  return (
    <motion.div
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      animate={{ rotateX: rx, rotateY: ry }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

/** CountUp — animated number counter (react-bits: CountUp) */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (reduce) return; // no animation; initial state already = value
    let raf = 0;
    const start = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);
  return <>{display}{suffix}</>;
}

/** ShinyText — subtle single-tone shimmer on text (react-bits: ShinyText) */
export function ShinyText({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span
      className={className}
      style={{
        background: "linear-gradient(90deg, var(--text-dim), var(--text), var(--text-dim))",
        backgroundSize: reduce ? "100% 100%" : "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: reduce ? "none" : "bp18-shiny 3s linear infinite",
      }}
    >
      {children}
      <style>{`@keyframes bp18-shiny { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </span>
  );
}

/** CardSwap — auto-rotating stack (react-bits: CardSwap) */
export function CardSwap({ items, interval = 4000, height = 200 }: { items: ReactNode[]; interval?: number; height?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || items.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval, reduce]);
  return (
    <div style={{ position: "relative", height }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          style={{ position: "absolute", inset: 0 }}
        >
          {items[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
