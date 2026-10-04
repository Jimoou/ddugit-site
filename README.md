# ddugit-site

[ddugit.com](https://ddugit.com): 소개, 다운로드, 가격, 변경 내역, 계정(라이선스 관리).

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
