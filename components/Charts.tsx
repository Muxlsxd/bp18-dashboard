"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const COLORS = {
  accent: "#38e1c4",
  accent2: "#4d8dff",
  danger: "#ff5c6c",
  warn: "#ffb454",
  ok: "#3ddc84",
  dim: "#6b7a90",
};

const AXIS = { fill: "#6b7a90", fontSize: 11 };
const GRID = "#1f2937";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 10 }}>{title}</div>
      <div style={{ width: "100%", height: 240 }}>{children}</div>
    </div>
  );
}

export function StatusPie({ data, labelKey = "name", valueKey = "value", palette }: {
  data: any[]; labelKey?: string; valueKey?: string; palette?: string[];
}) {
  const pal = palette || [COLORS.ok, COLORS.accent2, COLORS.warn, COLORS.danger, COLORS.dim];
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={labelKey} innerRadius={45} outerRadius={80} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={pal[i % pal.length]} />)}
        </Pie>
        <Tooltip contentStyle={ttStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#c9d4e3" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GroupedBar({ data, bars, xKey }: {
  data: any[]; bars: { key: string; color: string; name: string }[]; xKey: string;
}) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} stroke={GRID} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis tick={AXIS} stroke={GRID} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#c9d4e3" }} />
        {bars.map((b) => <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={[3, 3, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleBar({ data, xKey, yKey, color = COLORS.accent, name }: {
  data: any[]; xKey: string; yKey: string; color?: string; name?: string;
}) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} stroke={GRID} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis tick={AXIS} stroke={GRID} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={yKey} name={name} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const ttStyle = {
  background: "#11161f",
  border: "1px solid #2d3a4d",
  borderRadius: 6,
  fontSize: 12,
  color: "#c9d4e3",
};

export { Card, COLORS };
