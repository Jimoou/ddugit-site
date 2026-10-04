# CLAUDE.md

ddugit.com 사이트. Next.js 16 (App Router, `src/`), Netlify, Supabase.

@AGENTS.md

- 명령: `npm run check`(tsc + eslint + prettier), `npm run build`. push 전에 둘 다 통과시킨다
- 화면 문구는 한국어, 코드·주석·커밋은 영어(Conventional Commits)
- 사이트 전체 값(이름, 가격, 연락처)은 `src/site.ts` 한 곳에 둔다
- 스타일은 `src/app/globals.css` 하나(앱과 같은 우주 테마). Tailwind는 쓰지 않는다
- 다운로드 목록은 `downloads.json`(ddugit `scripts/downloads.mjs`가 만듦)을 읽는다. 형식은 `src/downloads.ts`
- 비밀 값(Supabase service_role 등)은 코드·저장소에 두지 않는다. 공개 값만 `NEXT_PUBLIC_*`
- 로그인: Supabase Auth(`@supabase/ssr`). 서버용 클라이언트는 `src/lib/supabase/server.ts`, 세션 갱신은 `src/proxy.ts`(Next 16에서 middleware → proxy, `/account`에만), OAuth 복귀는 `/auth/callback`. 로그인 버튼 목록은 `site.ts`의 `LOGIN_PROVIDERS`(Supabase에서 켠 공급자만)
