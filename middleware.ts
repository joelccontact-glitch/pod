export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // 다음 경로들을 보호 대상에서 제외:
    // - api/auth 하위 (로그인, 콜백 등)
    // - _next/static (정적 파일)
    // - _next/image (이미지 최적화)
    // - favicon.ico (파비콘)
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)"
  ]
};
