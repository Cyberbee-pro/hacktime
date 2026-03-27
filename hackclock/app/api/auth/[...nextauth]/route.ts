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
              activeRoomId: user.activeRoomId // Catching the room ID from the backend!
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
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image; 
        token.activeRoomId = (user as any).activeRoomId;
      }
      
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.activeRoomId !== undefined) token.activeRoomId = session.activeRoomId;
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.activeRoomId = token.activeRoomId;
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