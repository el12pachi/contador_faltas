import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Control de Asistencia | Contador de Faltas",
  description: "Gestiona y monitorea tus faltas de asistencia de manera sencilla y elegante",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth dark" data-theme="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans dark`}
      >
        {children}
      </body>
    </html>
  );
}
