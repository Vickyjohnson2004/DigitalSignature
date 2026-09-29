import "./globals.css";
import { ReactNode } from "react";
import { AppProviders } from "../components/AppProviders";

export const metadata = {
  title: "DigitalSignature Suite",
  description:
    "Compare RSA-PSS, DSA, ECDSA and Ed25519 — sign, verify, and benchmark digital signature algorithms.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
