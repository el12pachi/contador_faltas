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
  title: "Contador de Faltas | Control de Asistencia",
  description:
    "Gestiona y monitorea tus faltas y asistencia en cursos de forma sencilla y elegante.",
  openGraph: {
    title: "Contador de Faltas | Control de Asistencia",
    description:
      "Gestiona y monitorea tus faltas y asistencia en cursos de forma sencilla y elegante.",
    url: "https://contador-faltas.app",
    siteName: "Contador de Faltas",
    images: [
      {
        url: "https://via.placeholder.com/1200x630.png?text=Contador+de+Faltas",
        width: 1200,
        height: 630,
        alt: "Contador de Faltas - Control de asistencia",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contador de Faltas | Control de Asistencia",
    description:
      "Gestiona y monitorea tus faltas y asistencia en cursos de forma sencilla y elegante.",
    images: [
      "https://via.placeholder.com/1200x630.png?text=Contador+de+Faltas",
    ],
  },
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
