import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createOrUpdateUser } from "@/app/actions/auth";
import { googleSubToUuid } from "@/lib/utils/id";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        console.log("[NextAuth] Google profile received:", profile);
        return {
          id: googleSubToUuid(profile.sub),
          name: profile.name || profile.email?.split("@")[0] || "User",
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log(
        "[NextAuth] signIn callback. User:",
        user,
        "Account:",
        account
      );
      if (account?.provider === "google" && user) {
        const result = await createOrUpdateUser({
          id: user.id,
          email: user.email!,
          name: user.name!,
          image: user.image,
        });
        console.log("[NextAuth] createOrUpdateUser result:", result);
        if (result.error) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        console.log("[NextAuth] jwt attaching user.id:", user.id);
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        console.log("[NextAuth] session:", session);
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  debug: true, // enables NextAuth debug logging
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
