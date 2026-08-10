import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BP18 Frame & Body Dashboard",
  description: "BlackPearl FSAE — Frame & Body subsystem control surface",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
