import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { SITE } from "@/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description:
    "ddugit은 커밋 그래프를 중심에 둔 macOS·Windows Git 클라이언트입니다. 끌어서 병합하고, rebase를 목록으로 정리하고, 여러 저장소를 한눈에 봅니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="top">
          <Link href="/" className="brand" aria-label={SITE.name}>
            <Wordmark />
          </Link>
          <nav>
            <Link href="/download">다운로드</Link>
            <Link href="/pricing">가격</Link>
            <Link href="/changelog">변경 내역</Link>
            <Link href="/account" className="ghost">
              내 계정
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="bottom">
          <span>© {new Date().getFullYear()} ddugit</span>
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
        </footer>
      </body>
    </html>
  );
}
