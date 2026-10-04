# ddugit-site

[ddugit.com](https://ddugit.com): 소개, 다운로드, 가격, 계정(라이선스 관리). 사이트 문구는 영어로 고정(2026-10-04). 변경 내역은 나중에 "문서" 메뉴와 함께.

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_DOWNLOADS_URL
npm run dev                  # localhost:3000
npm run check                # typecheck + eslint + prettier --check
npm run build
```

- 호스팅: Netlify (`main` push → 배포)
- 설치 파일: Supabase Storage `releases` 버킷. ddugit 저장소의 Release workflow가 올리고 `downloads.json`을 쓴다
- 다운로드와 앱 사용에는 로그인이 없다. 로그인(GitHub·Google, Supabase Auth)은 구매·라이선스 관리에만 쓴다

## 라이선스 (Supabase)

- `supabase/migrations/`: `licenses` 테이블. 로그인한 사람은 자기 이메일로 산 라이선스만 읽는다(RLS)
- `supabase/functions/license-refresh`: 앱이 가진 라이선스를 받아, 구독이 살아 있으면 만료일을 늘려 다시 서명한다. 앱은 `ddugit.com/api/license/refresh`로 부른다(`src/app/api/license/refresh`)
- `supabase/functions/_shared/license.ts`: 라이선스 형식(앱의 `license.rs`와 같음). `npm test`
- 배포: `main`에 `supabase/`가 바뀌면 `.github/workflows/supabase.yml`이 마이그레이션과 함수를 올린다

한 번 설정:

1. 이 저장소 Secrets: `SUPABASE_ACCESS_TOKEN`(supabase.com → Account → Access Tokens), `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`
2. Supabase → Edge Functions → Secrets: `DDUGIT_LICENSE_PRIVATE_KEY`(ddugit `scripts/license.mjs keygen`이 만든 PEM 전체), `DDUGIT_LICENSE_PUBKEY`(같은 키의 공개키, ddugit 저장소 Variables와 같은 값)
