import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_EMAIL = "joelc.contact@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // 지정된 이메일만 로그인 허용
      if (user.email === ALLOWED_EMAIL) {
        return true;
      }
      console.log(`Access Denied for email: ${user.email}`);
      return false; 
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    // 필요 시 커스텀 로그인 페이지 추가 가능 (현재는 구글 기본 화면 사용)
    // signIn: '/login', 
    error: '/', // 로그인 실패 시 홈으로 이동
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
