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

## Auth settings (Supabase 대시보드, 저장소 밖)

라이선스·기기·관리자 권한은 모두 로그인의 이메일(`auth.jwt() ->> 'email'`)로 판단한다. 그래서 그 이메일이 확인된 것이어야 한다. Supabase → Authentication에서 확인하고, 바꾸면 여기 날짜를 적는다:

- [ ] **Sign In / Providers → Email: 끈다**(사이트는 GitHub·Google만 쓴다). 켜 둬야 한다면 **Confirm email: 켬**, **Secure email change: 켬**(둘 중 하나라도 꺼져 있으면 누구나 남의 이메일로 가입하거나 `auth.updateUser({ email })`로 바꿔 그 사람의 라이선스·기기·관리자 화면을 쓸 수 있다)
- [ ] **Anonymous sign-ins: 끔**
- [ ] GitHub·Google만 켬(`site.ts`의 `LOGIN_PROVIDERS`와 같게). URL Configuration의 Site URL `https://ddugit.com`, Redirect URLs에 `https://ddugit.com/auth/callback`

## 서버 환경 변수 한눈에

| 어디             | 이름                                                                                       | 필수    | 설명                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Netlify          | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`                                | 예      | 공개 값                                                                                                                                               |
| Netlify          | `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_PRICE_ID`, `NEXT_PUBLIC_PADDLE_ENV` | 판매 시 | 공개 값. 셋이 맞아야(`test_` 토큰은 `sandbox`, `live_`는 그 외, 가격은 `pri_…`) 구매 버튼이 열린다                                                    |
| Netlify          | `REPORT_FORWARD_SECRET`                                                                    | 예      | Supabase와 같은 값. 없으면 `/api/report` 503                                                                                                          |
| Netlify          | `ALLOW_TEST_LICENSES`                                                                      | 아니오  | `true`면 `/activate`가 테스트 주문 라이선스도 고른다. 테스트 구매할 때만                                                                              |
| Supabase Secrets | `DDUGIT_LICENSE_PRIVATE_KEY`, `DDUGIT_LICENSE_PUBKEY`                                      | 예      | 라이선스 서명·확인                                                                                                                                    |
| Supabase Secrets | `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRODUCT_ID`                                               | 예      | 상품 id(`pro_…`) 없으면 웹훅이 라이선스를 만들지 않는다(500)                                                                                          |
| Supabase Secrets | `PADDLE_API_KEY`, `PADDLE_ENV`                                                             | 예      | API 키 권한: Customers 읽기(이메일 없는 결제의 구매자 조회), Adjustments 쓰기(계정 페이지 환불 요청). `PADDLE_ENV=sandbox`면 sandbox API·`store_test` |
| Supabase Secrets | `REPORT_SALT`, `REPORT_FORWARD_SECRET`                                                     | 예      | 없으면 `report` 503                                                                                                                                   |
| Supabase Secrets | `ALLOW_TEST_LICENSES`                                                                      | 아니오  | `true`면 테스트 주문 라이선스를 활성화·유지한다. 평소에는 비워 둔다                                                                                   |

`https://ddugit.com/api/status`가 Netlify 쪽 값이 있는지(이름만) 보여 준다.

## 보안 헤더

`next.config.ts`가 모든 페이지에 붙인다: `Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`(`/activate`는 `no-referrer`), `Permissions-Policy`, HSTS. 스크립트 CSP(`script-src`)는 Next의 인라인 스크립트에 요청마다 nonce가 필요해서 넣지 않았고, `form-action`은 서버 액션이 GitHub·Google 로그인과 앱의 `127.0.0.1`로 리디렉트하므로 넣지 않는다.

## 라이선스 (Supabase)

- 판매: 평생 라이선스 하나(`site.ts`의 `PRO_PRICE`, 한 번 결제, 이후 업데이트 모두 포함), 라이선스당 기기 3대(`licenses.max_devices`). 사이트 라이선스(`kind = 'site'`)는 기기 제한이 없다
- `supabase/migrations/`: `licenses`, `activations`, `devices` 테이블. 로그인한 사람은 자기 이메일로 산 라이선스와 그 기기만 읽고, 기기는 지울 수만 있다(RLS). 기기 추가는 함수(service role)만, 한도는 트리거(`devices_within_limit`)가 지킨다. API 역할의 권한은 사이트가 쓰는 것만 남긴다(`20261008000000_license_grants.sql`: authenticated는 licenses select, devices select·delete, activations의 네 열 insert만, anon은 없음)
- 새 마이그레이션 이름은 이미 적용된 것보다 뒤여야 한다(`supabase db push`가 앞선 것을 거부한다). 지금 마지막은 `20261009000000`이므로 실제 날짜가 그보다 앞이면 그 뒤 번호를 손으로 붙인다
- `supabase/functions/license-activate`: `/activate`가 준 1회용 코드 + 앱의 기기 id → 라이선스가 쓸 수 있는지 먼저 확인(아래 규칙) → 기기 등록 후 그 기기용으로 서명한 라이선스(`ddugit.com/api/license/activate`)
- `supabase/functions/license-deactivate`: 앱의 "이 기기 제거". 서명된 라이선스 + 기기 id → 기기 행 삭제(`ddugit.com/api/license/deactivate`)
- `supabase/functions/license-refresh`: 앱이 시작할 때·하루마다 갖고 있는 라이선스를 확인한다(`ddugit.com/api/license/refresh`). 쓸 수 있으면 그대로(사이트 라이선스는 저장된 최신 텍스트), 못 쓰면 `expired`, 기기에 묶인 라이선스의 행이 없거나 그 기기가 지워졌으면 `removed`(앱이 Pro를 끈다), 기기에 안 묶인 라이선스의 행이 없으면 `unknown`
- 쓸 수 있는 라이선스 규칙(하나, `_shared/license.ts`의 `unusable`): 종류와 상관없이 `status = 'active'`이고, 스토어 테스트 주문(`store_test`)은 `ALLOW_TEST_LICENSES=true`일 때만. license-activate·license-refresh와 사이트의 `/activate`가 같은 규칙을 쓴다. 구독(월·연)은 판 적이 없어 코드에서 지웠다(`paid_through` 등 열은 남아 있지만 쓰지 않는다)
- `supabase/functions/paddle-webhook`: Paddle Billing 웹훅. `transaction.completed` → 평생 라이선스 행(`store_order_id` = 거래 id `txn_…`, 기기 3대 × 수량), 승인된 전액 환불·차지백(`adjustment.created`/`updated`, `action` refund/chargeback, `status` approved, `type`이 partial이 아님) → `store_refunds`에 기록하고 `status = 'refunded'`(앱은 다음 확인 때 Pro를 끈다). 환불이 거래보다 먼저 와도 거래를 넣은 뒤 `store_refunds`를 보고 바로 환불 처리한다. 부분 환불·다른 이벤트·다른 상품은 200으로 무시. 서명은 `Paddle-Signature`(`ts:본문`의 HMAC-SHA256, 5분 넘은 것은 거부). 라이선스는 `custom_data.email`(체크아웃 때 넘긴 로그인 이메일)로, 없으면 Paddle API로 고객 이메일을 조회한다. `PADDLE_PRODUCT_ID`가 없으면 아무 라이선스도 만들지 않고 500. 순수 로직은 `_shared/store.ts`
- `supabase/functions/_shared/license.ts`: 라이선스 형식(앱의 `license.rs`와 같음)과 사용 가능 규칙. 함수 공통은 `_shared/http.ts`(`json`, `env`, `handle`: POST만, 빠진 설정은 500 "not configured")와 `_shared/db.ts`(`serviceDb`, 서명 키). Next도 `_shared`의 순수 모듈(`license.ts`, `report.ts`, `email.ts`)을 직접 가져온다(`tsconfig`의 `allowImportingTsExtensions`). `npm test`
- 배포: `main`에 `supabase/`가 바뀌면 `.github/workflows/supabase.yml`이 마이그레이션과 함수를 올린다

한 번 설정:

1. 이 저장소 Secrets: `SUPABASE_ACCESS_TOKEN`(supabase.com → Account → Access Tokens), `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`
2. Supabase → Edge Functions → Secrets: `DDUGIT_LICENSE_PRIVATE_KEY`(ddugit `scripts/license.mjs keygen`이 만든 PEM 전체), `DDUGIT_LICENSE_PUBKEY`(같은 키의 공개키, ddugit 저장소 Variables와 같은 값)
3. 판매(Paddle Billing, 판매자: 개인 `site.ts`의 `SITE.legalName`, 화면의 이름은 활동명 `SITE.maker`(Grapipe)). 먼저 sandbox(sandbox-vendors.paddle.com)에서 끝까지 해 보고, live 계정(vendors.paddle.com)에서 같은 순서로 한 번 더: 0. Claude Code: `.claude/settings.json`이 Paddle 공식 플러그인(`paddle@claude-community`: 웹훅·체크아웃·sandbox 테스트·상품 설정 안내)을 켠다. 플러그인의 MCP 서버(`mcp.paddle.com`, `sandbox-mcp.paddle.com`, `paddlehq.mcp.kapa.ai`)는 클라우드 세션 네트워크에서 그 호스트를 허용해야 붙고, sandbox 서버는 API 키를 `/plugin configure paddle@claude-community`로 넣는다(채팅·저장소에 넣지 않는다)
   1. Checkout → Website approval: `ddugit.com`을 추가하고 심사를 받는다(약관·개인정보·가격·환불 14일·판매자 이름·연락처가 사이트에 있어야 한다)
   2. Catalog → Products: "ddugit Pro"(세금 분류 `digital-goods` = 내려받는 소프트웨어. **첫 판매 뒤에는 바꿀 수 없다.** 기본값이 아닌 분류라 대시보드에서 승인이 필요할 수 있다), Price: One-time `$29 USD`(`site.ts`의 `PRO_PRICE`와 같게)
   3. Checkout → Checkout settings → Default payment link: `https://ddugit.com/checkout`
   4. Developer tools → Authentication: Client-side token → Netlify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`. API key(Customers 읽기·Adjustments 쓰기) → Supabase `PADDLE_API_KEY`
   5. Developer tools → Notifications → New destination(Paddle은 5초 안에 2xx를 받아야 전달로 친다. 넘으면 다시 보내고, 함수는 같은 거래를 한 번만 처리하므로 안전하다): URL `https://<project-ref>.supabase.co/functions/v1/paddle-webhook`, 이벤트 `transaction.completed`·`adjustment.created`·`adjustment.updated`. 만든 뒤 보이는 Secret key → Supabase `PADDLE_WEBHOOK_SECRET`
   6. Supabase Secrets: **필수** `PADDLE_PRODUCT_ID` = 상품 id(`pro_…`, 여러 개면 쉼표), `PADDLE_ENV` = `sandbox`(sandbox일 때만, live는 비우거나 `production`)
   7. Netlify: `NEXT_PUBLIC_PADDLE_PRICE_ID` = 가격 id(`pri_…`), `NEXT_PUBLIC_PADDLE_ENV` = `sandbox` 또는 `production`, 다시 배포. 토큰과 환경이 안 맞으면 가격 페이지 버튼은 "Available soon"
   8. sandbox로 끝까지 사 보기: 테스트 카드 `4242 4242 4242 4242`(만료일은 미래, CVC 아무 세 자리). Supabase Secrets와 Netlify **둘 다**에 `ALLOW_TEST_LICENSES=true`를 넣어야 sandbox 라이선스(`store_test`)를 활성화할 수 있다. 사 보고, 앱에서 활성화하고, Paddle에서 환불해 Pro가 꺼지는 것까지 본 뒤 두 곳에서 **지우고**(Netlify는 다시 배포) 테스트 라이선스는 끈다: `update public.licenses set status = 'revoked' where store_test;`

구매 흐름: 가격 페이지 → `/checkout`(로그인 안 했으면 로그인 후 돌아옴. 로그인 없는 결제는 없앴다: 계정 하나에 Pro 하나. 이미 Pro가 있으면 결제창 대신 계정 페이지로 안내) → 같은 페이지에서 Paddle.js 오버레이 체크아웃(로그인 이메일을 `customer.email`로 고정하고 `customData.email`로도 넘김) → 웹훅이 그 이메일로 라이선스 행을 만든다 → `/thanks` → 앱의 설정 → License → "Sign in with ddugit.com". `/checkout?_ptxn=txn_…`(Paddle 결제 링크)는 로그인 없이 그 거래를 연다.

계정 페이지(`/account`): 라이선스마다 **오프라인 활성화 코드**(IntelliJ 방식: `license-offline` 함수가 로그인 세션으로 확인하고 기기에 묶지 않은 평생 라이선스를 서명해 준다. 인터넷 없는 컴퓨터의 앱 설정 → 라이선스 → 붙여 넣기에 넣는다. 온라인이 되면 환불·취소된 라이선스는 내려놓는다. 환불 기간 안의 첫 코드는 "환불 불가" 동의(`noRefund`)를 받고 `offline_issued_at`을 찍는다: 인터넷에 안 붙는 컴퓨터에는 환불이 닿지 않으므로 첫 코드가 환불을 끝낸다)와 **환불 요청**(결제 14일 안, 오프라인 코드를 만든 적이 없을 때(`refundable`의 `offline`), `license-refund` 함수가 로그인 세션으로 확인하고 `refund_requested_at`을 먼저 찍은 뒤 Paddle에 전액 환불 adjustment를 만든다. Paddle이 승인하면 웹훅이 `refunded`로). 앱 활성화가 실패하면 앱이 `/activate/done?result=failed&reason=signature|other-device|server`로 보내고 페이지가 이유별로 안내한다(`signature` = 앱의 공개키와 서버 서명 키가 짝이 아님)

## 문제 신고·문의 (Supabase)

앱과 사이트(`/contact`)는 이메일 대신 HTTPS로 보낸다: `POST ddugit.com/api/report` → Next 라우트(`src/app/api/report`)가 공유 비밀(`x-ddugit-forward: <REPORT_FORWARD_SECRET>`)과 방문자 IP(`x-ddugit-client-ip`, Netlify가 넣는 `x-nf-client-connection-ip`만 믿는다)를 실어 `report` 함수로 넘긴다. 함수는 비밀이 맞을 때만(상수 시간 비교) 받고 그 IP를 믿는다. 함수를 직접 부르면 403. 비밀이 어느 한쪽에라도 없으면 둘 다 503(닫힘).

- 요청: `{ kind: "bug"|"question", message(1..5000), email?(≤254, `? & % #`·슬래시·따옴표 없는 주소), diagnostics?(≤20000), source: "app"|"web", appVersion?(≤32), os?(≤64), website?(허니팟) }` → `200 { ok, id }` | `400 { error }` | `403`(사이트를 거치지 않음) | `413`(64KB 초과) | `429 { error: "Too many reports. Try again later." }` | `503`(설정 없음) | `5xx`
- `supabase/functions/report`: 검사(순수 로직 `_shared/report.ts`, `npm test`), 허니팟이 차 있으면 저장 없이 200, 보낸 사람(= `REPORT_SALT`와 IP의 SHA-256)당 시간당 5건 + 전체 시간당 200건. IP 자체와 내용(메시지·이메일)은 저장·로그하지 않는다(해시만 `reports.sender_hash`)
- `reports` 테이블: 함수(service role)만 넣는다. 관리자(`admins`의 이메일, 대소문자 무시)만 읽고, `status`(new/read/done)·`note`만 고칠 수 있다(RLS + 열 단위 권한). API로는 아무도 지울 수 없다
- `/admin`: 관리자만(그 밖에는 404). 상태·종류·출처 필터, 상태별 개수, 펼치면 메시지·답장 메일 링크(주소가 엄격한 검사를 통과할 때만, 인코딩해서: `_shared/email.ts`의 `replyLink`)·버전·OS·진단 정보, 상태 바꾸기와 비공개 메모. 계정 페이지에 관리자에게만 링크가 보인다

한 번 설정:

1. Supabase → Edge Functions → Secrets: `REPORT_SALT` = 임의의 긴 값(예: `openssl rand -hex 32`). 바꾸면 그때부터 속도 제한이 새로 센다
2. 전달 비밀 `REPORT_FORWARD_SECRET` = 임의의 긴 값(`openssl rand -hex 32`) 하나를 **두 곳에 같게**: Supabase → Edge Functions → Secrets, 그리고 Netlify → Site configuration → Environment variables(서버 전용, `NEXT_PUBLIC_` 아님, 넣은 뒤 다시 배포). 둘 중 하나라도 없으면 신고가 503으로 막힌다. 바꿀 때는 두 곳을 함께 바꾼다(그 사이 신고는 403)
3. 마이그레이션과 함수는 `main`에 머지되면 Supabase workflow가 올린다(`20261007000000_reports.sql`, `report` 함수). 소유자의 로그인 이메일은 마이그레이션이 관리자로 넣는다(문의 주소 `support@grapipe.com`과는 다르다)
4. 관리자 추가: Supabase → SQL Editor에서 `insert into public.admins (email) values ('someone@example.com');`(그 사람이 ddugit.com에 로그인하는 GitHub·Google 계정의 이메일). 빼기는 `delete from public.admins where email = '…';`
5. 오래된 신고 지우기(필요할 때): `delete from public.reports where status = 'done' and created_at < now() - interval '1 year';`
