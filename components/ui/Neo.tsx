import { CSSProperties, ReactNode } from "react";

export function NeoCard({ children, className = "", inset = false, style }: { children: ReactNode; className?: string; inset?: boolean; style?: CSSProperties }) {
  return (
    <div className={`${inset ? "neo-inset" : "neo"} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function NeoButton({ children, onClick, className = "", style }: { children: ReactNode; onClick?: () => void; className?: string; style?: CSSProperties }) {
  return (
    <button className={`neo-btn ${className}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

type BadgeTone = "green" | "yellow" | "red" | "dim";
export function NeoBadge({ children, tone = "dim" }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`neo-badge badge-${tone}`}>{children}</span>;
}
