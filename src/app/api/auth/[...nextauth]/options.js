import GoogleProvider from "next-auth/providers/google";
import { loginUser } from "../../../functions/bd";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        // Evita timeouts rápidos en redes lentas
        timeout: 15000,
      },
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.email = token.email;
        session.user.nombre = token.nombre;
        session.user.urlLogo = token.urlLogo;
        session.user.token = token.token;
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.email = user.email;
        token.nombre = user.nombre;
        token.urlLogo = user.urlLogo;
        token.token = user.token;
      }

      return token;
    },
    async signIn({ user, account, profile }) {
      try {
        if (!user || !user.email) {
          console.error("Error en signIn: usuario o email no válido");
          return false;
        }

        // Preparar datos del usuario
        const userData = {
          email: user.email,
          name: user.name || profile?.name || user.email.split('@')[0],
          nombre: user.name || profile?.name || user.email.split('@')[0],
          image: user.image || profile?.picture || null,
          urlLogo: user.image || profile?.picture || null,
          id: user.id || account?.providerAccountId || user.email
        };

        const result = await loginUser(user.email, userData);
        if (!result || !result.token) {
          console.error("Error en signIn: no se pudo crear/obtener el usuario");
          return false;
        }

        // Actualizar el objeto user con los datos de la base de datos
        user.email = result.email;
        user.nombre = result.nombre;
        user.urlLogo = result.urlLogo;
        user.token = result.token;

        return true;
      } catch (error) {
        console.error("Error en signIn:", error);
        return false;
      }
    }
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

