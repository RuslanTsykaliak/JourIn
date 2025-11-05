
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Authorization Error: Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("User not found.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth", // Redirect to your custom login page
    error: "/api/auth/error", // <--- ADDED THIS LINE
    // You can also define other pages like signOut, verifyRequest, newUser
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user ID to the token
      if (user) {
        token.id = user.id;
        token.email = user.email; // Add email to token
        token.name = user.name; // Add name to token
        // Add any other user properties you want to access in the session
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID from token to session
      if (token.id) {
        session.user.id = token.id as string;
      }
      // Add other properties from token to session
      if (token.email) {
        session.user.email = token.email;
      }
      if (token.name) {
        session.user.name = token.name;
      }
      return session;
    },
  },
};
