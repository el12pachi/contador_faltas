import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "./functions/sessionServer";
import LoginPage from "./components/login/Login";
import SessionProvider from "./providers/SessionProvider";

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

export default async function RootLayout({ children }) {
  const session = await getSession();

  if (session?.login || !session.token || !session.email) {
    return (
      <html lang="es" className="scroll-smooth dark" data-theme="dark">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans dark`}>
          <LoginPage />
        </body>
      </html>
    );
  }

  return (
    <html lang="es" className="scroll-smooth dark" data-theme="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans dark`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
