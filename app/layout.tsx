import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plansy",
  description: "Командный календарь",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}