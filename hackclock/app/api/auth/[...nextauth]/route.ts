import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Terminal Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" }
          });

          const user = await res.json();

          if (res.ok && user) {
            return {
              id: user.id,
              name: user.name, 
              email: user.email,
              image: user.profilePic, 
            };
          }
          
          return null;
        } catch (error) {
          console.error("Auth fetch error:", error);
          return null;
        }
      }
    })
  ],
  // NEW: Callbacks to handle dynamic session updates
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Initial Sign-in: Map user data to the token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image; // NextAuth uses 'picture' internally for images
      }
      
      // 2. Client Update Trigger: Modify the token on the fly
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Pass the updated token data back into the active session
      if (session.user) {
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };