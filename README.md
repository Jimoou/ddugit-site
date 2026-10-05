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

- 판매: 평생 라이선스 하나(`site.ts`의 `PRO_PRICE`, 한 번 결제, 이후 업데이트 모두 포함), 라이선스당 기기 3대(`licenses.max_devices`). 사이트 라이선스(`kind = 'site'`)는 기기 제한이 없다
- `supabase/migrations/`: `licenses`, `activations`, `devices` 테이블. 로그인한 사람은 자기 이메일로 산 라이선스와 그 기기만 읽고, 기기는 지울 수만 있다(RLS). 기기 추가는 함수(service role)만, 한도는 트리거(`devices_within_limit`)가 지킨다
- `supabase/functions/license-activate`: `/activate`가 준 1회용 코드 + 앱의 기기 id → 라이선스가 쓸 수 있는지 먼저 확인(아래 규칙) → 기기 등록 후 그 기기용으로 서명한 라이선스(`ddugit.com/api/license/activate`)
- `supabase/functions/license-deactivate`: 앱의 "이 기기 제거". 서명된 라이선스 + 기기 id → 기기 행 삭제(`ddugit.com/api/license/deactivate`)
- `supabase/functions/license-refresh`: 앱이 시작할 때·하루마다 갖고 있는 라이선스를 확인한다(`ddugit.com/api/license/refresh`). 쓸 수 있으면 그대로(사이트 라이선스는 저장된 최신 텍스트), 못 쓰면 `expired`, 기기에 묶인 라이선스의 행이 없거나 그 기기가 지워졌으면 `removed`(앱이 Pro를 끈다), 기기에 안 묶인 라이선스의 행이 없으면 `unknown`
- 쓸 수 있는 라이선스 규칙(하나, `_shared/license.ts`의 `unusable`): 종류와 상관없이 `status = 'active'`이고, 스토어 테스트 주문(`store_test`)은 `ALLOW_TEST_LICENSES=true`일 때만. license-activate·license-refresh와 사이트의 `/activate`가 같은 규칙을 쓴다. 구독(월·연)은 판 적이 없어 코드에서 지웠다(`paid_through` 등 열은 남아 있지만 쓰지 않는다)
- `supabase/functions/ls-webhook`: Lemon Squeezy 웹훅. `order_created`(결제 완료) → 평생 라이선스 행(`store_order_id` = 주문 id, 기기 3대 × 수량), `order_refunded`(전액 환불) → `status = 'refunded'`(앱은 다음 확인 때 Pro를 끈다). 부분 환불·다른 이벤트·다른 상품은 200으로 무시. 같은 주문은 한 행(재전송·순서 바뀜에도 안전). 테스트 모드 주문은 `store_test = true`. `LEMONSQUEEZY_PRODUCT_ID`가 없으면 아무 라이선스도 만들지 않고 500(로그: `not configured: LEMONSQUEEZY_PRODUCT_ID is not set`)을 돌려준다. 스토어가 다시 보내므로 설정한 뒤 들어온 주문은 처리된다. 순수 로직은 `_shared/store.ts`
- `supabase/functions/_shared/license.ts`: 라이선스 형식(앱의 `license.rs`와 같음)과 사용 가능 규칙. 함수 공통은 `_shared/http.ts`(`json`, `env`, `handle`: POST만, 빠진 설정은 500 "not configured")와 `_shared/db.ts`(`serviceDb`, 서명 키). Next도 `_shared`의 순수 모듈(`license.ts`, `report.ts`, `email.ts`)을 직접 가져온다(`tsconfig`의 `allowImportingTsExtensions`). `npm test`
- 배포: `main`에 `supabase/`가 바뀌면 `.github/workflows/supabase.yml`이 마이그레이션과 함수를 올린다

한 번 설정:

1. 이 저장소 Secrets: `SUPABASE_ACCESS_TOKEN`(supabase.com → Account → Access Tokens), `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`
2. Supabase → Edge Functions → Secrets: `DDUGIT_LICENSE_PRIVATE_KEY`(ddugit `scripts/license.mjs keygen`이 만든 PEM 전체), `DDUGIT_LICENSE_PUBKEY`(같은 키의 공개키, ddugit 저장소 Variables와 같은 값)
3. 판매(Lemon Squeezy):
   1. 상품 하나: Single payment, `$29`(`site.ts`의 `PRO_PRICE`와 같게). 수량 선택을 켜면 한 주문이 기기 3대 × 수량이 된다
   2. Settings → Webhooks → 추가: URL `https://<project-ref>.supabase.co/functions/v1/ls-webhook`, 이벤트 `order_created`·`order_refunded`, Signing secret은 임의의 긴 값
   3. Supabase → Edge Functions → Secrets: `LEMONSQUEEZY_WEBHOOK_SECRET` = 위 Signing secret, **필수** `LEMONSQUEEZY_PRODUCT_ID` = Pro 상품 id(여러 개면 쉼표로, 예: `123456,123457`). 없으면 웹훅이 라이선스를 만들지 않는다(500). 다른 상품 주문은 무시
   4. 상품 → Share → 체크아웃 링크(`https://<store>.lemonsqueezy.com/buy/<variant-uuid>`)를 Netlify 환경 변수 `NEXT_PUBLIC_LS_CHECKOUT_URL`에 넣고 다시 배포한다. 없으면 가격 페이지 버튼은 "Available soon"
   5. 상품의 Confirmation modal → Button link(결제 후 이동)를 `https://ddugit.com/thanks`로
   6. 테스트 모드로 끝까지 사 보기: Supabase Secrets와 Netlify 환경 변수 **둘 다**에 `ALLOW_TEST_LICENSES=true`를 넣는다(없으면 테스트 주문은 계정 페이지에 "Test order"로 보이기만 하고 `/activate`가 고르지 않으며, license-activate는 "This license comes from a test purchase…"로 거절, license-refresh는 `expired`). 사 보고 앱에서 활성화해 본 뒤 두 곳에서 **지우고**(Netlify는 다시 배포), 테스트 라이선스는 지우지 말고 끈다: `update public.licenses set status = 'revoked' where store_test;`. 그러면 그 라이선스를 받은 앱은 다음 확인 때 Pro를 끈다(행을 지워도 기기에 묶인 라이선스는 `removed`로 꺼지지만, 기록이 남는 쪽이 낫다)

구매 흐름: 가격 페이지 → `/checkout`(로그인 안 했으면 로그인 후 돌아옴) → Lemon Squeezy 체크아웃(`checkout[email]`·`checkout[custom][email]`에 로그인 이메일) → 웹훅이 그 이메일로 라이선스 행을 만든다 → `/thanks` → 앱의 설정 → License → "Sign in with ddugit.com". 결제 이메일을 바꿔도 라이선스는 로그인 이메일(`custom_data.email`)로 간다

## 문제 신고·문의 (Supabase)

앱과 사이트(`/contact`)는 이메일 대신 HTTPS로 보낸다: `POST ddugit.com/api/report` → Next 라우트(`src/app/api/report`)가 방문자 IP를 헤더(`x-ddugit-client-ip`, `x-forwarded-for`)에 실어 `report` 함수로 넘긴다.

- 요청: `{ kind: "bug"|"question", message(1..5000), email?(≤254), diagnostics?(≤20000), source: "app"|"web", appVersion?(≤32), os?(≤64), website?(허니팟) }` → `200 { ok, id }` | `400 { error }` | `413`(64KB 초과) | `429 { error: "Too many reports. Try again later." }` | `5xx`
- `supabase/functions/report`: 검사(순수 로직 `_shared/report.ts`, `npm test`), 허니팟이 차 있으면 저장 없이 200, 보낸 사람(= `REPORT_SALT`와 IP의 SHA-256)당 시간당 5건 + 전체 시간당 200건. IP 자체와 내용(메시지·이메일)은 저장·로그하지 않는다(해시만 `reports.sender_hash`)
- `reports` 테이블: 함수(service role)만 넣는다. 관리자(`admins`의 이메일, 대소문자 무시)만 읽고, `status`(new/read/done)·`note`만 고칠 수 있다(RLS + 열 단위 권한). API로는 아무도 지울 수 없다
- `/admin`: 관리자만(그 밖에는 404). 상태·종류·출처 필터, 상태별 개수, 펼치면 메시지·답장 메일 링크·버전·OS·진단 정보, 상태 바꾸기와 비공개 메모. 계정 페이지에 관리자에게만 링크가 보인다

한 번 설정:

1. Supabase → Edge Functions → Secrets: `REPORT_SALT` = 임의의 긴 값(예: `openssl rand -hex 32`). 없으면 함수가 503을 돌려준다. 바꾸면 그때부터 속도 제한이 새로 센다
2. 마이그레이션과 함수는 `main`에 머지되면 Supabase workflow가 올린다(`20261007000000_reports.sql`, `report` 함수). 소유자(`kfromh0136@gmail.com`)는 마이그레이션이 관리자로 넣는다
3. 관리자 추가: Supabase → SQL Editor에서 `insert into public.admins (email) values ('someone@example.com');`(그 사람이 ddugit.com에 로그인하는 GitHub·Google 계정의 이메일). 빼기는 `delete from public.admins where email = '…';`
4. 오래된 신고 지우기(필요할 때): `delete from public.reports where status = 'done' and created_at < now() - interval '1 year';`
