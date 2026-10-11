# CLAUDE.md

ddugit.com 사이트. Next.js 16 (App Router, `src/`), Netlify, Supabase.

@AGENTS.md

- 명령: `npm run check`(tsc + eslint + prettier), `npm run build`. push 전에 둘 다 통과시킨다
- 사이트 문구는 영어로 고정(2026-10-04 결정), 코드·주석·커밋도 영어(Conventional Commits)
- 디자인은 데스크톱 앱(frame A)과 같은 언어: 그래파이트 면(`--chrome`·`--bg`·`--surface`), 둥근 모서리(6·8px), 밝게 채운 주 버튼 하나(`--ui`), 포커스는 `--focus`. 네온 색(`--cyan` 등)은 데이터(상태·미터)에만, 크롬의 빛 번짐·괄호·스캔라인·보라색은 쓰지 않는다. 우주는 앱 화면과 로그인 그림 안에만. 토큰은 `globals.css` 맨 위
- 앱 화면은 `public/screens/*.webp`(데모 모드를 영어로 2x 캡처). 앱 UI가 바뀌면 다시 찍는다
- 사이트 전체 값(이름, 가격, 연락처)은 `src/site.ts` 한 곳에 둔다
- 스타일은 `src/app/globals.css` 하나. Tailwind는 쓰지 않는다
- 다운로드 목록은 `downloads.json`(ddugit `scripts/downloads.mjs`가 만듦)을 읽는다. 형식은 `src/downloads.ts`
- 비밀 값(Supabase service_role 등)은 코드·저장소에 두지 않는다. 공개 값만 `NEXT_PUBLIC_*`
- 로그인: Supabase Auth(`@supabase/ssr`). 클라이언트는 `src/lib/supabase/client.ts`의 `supabaseWith` 하나(쿠키 옵션: HttpOnly·Lax·운영에서 Secure, 브라우저용 Supabase 클라이언트는 없다), 서버용은 `server.ts`, 세션 갱신은 `src/proxy.ts`(Next 16에서 middleware → proxy, 로그인을 쓰는 페이지 모두: 새 페이지를 만들면 matcher에 넣는다), OAuth 복귀는 `/auth/callback`. 보안 헤더는 `next.config.ts`. 로그인 버튼 목록은 `site.ts`의 `LOGIN_PROVIDERS`(Supabase에서 켠 공급자만)
