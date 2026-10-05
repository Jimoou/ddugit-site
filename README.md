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
- `supabase/functions/license-activate`: `/activate`가 준 1회용 코드 + 앱의 기기 id → 기기 등록 후 그 기기용으로 서명한 라이선스(`ddugit.com/api/license/activate`)
- `supabase/functions/license-deactivate`: 앱의 "이 기기 제거". 서명된 라이선스 + 기기 id → 기기 행 삭제(`ddugit.com/api/license/deactivate`)
- `supabase/functions/license-refresh`: 예전 구독용(만료일 연장). 평생 라이선스는 그대로 돌려준다(`ddugit.com/api/license/refresh`)
- `supabase/functions/ls-webhook`: Lemon Squeezy 웹훅. `order_created`(결제 완료) → 평생 라이선스 행(`store_order_id` = 주문 id, 기기 3대 × 수량), `order_refunded`(전액 환불) → `status = 'refunded'`(앱은 다음 확인 때 Pro를 끈다). 부분 환불·다른 이벤트·다른 상품은 200으로 무시. 같은 주문은 한 행(재전송·순서 바뀜에도 안전). 테스트 모드 주문은 `store_test = true`. 순수 로직은 `_shared/store.ts`
- `supabase/functions/_shared/license.ts`: 라이선스 형식(앱의 `license.rs`와 같음). `npm test`
- 배포: `main`에 `supabase/`가 바뀌면 `.github/workflows/supabase.yml`이 마이그레이션과 함수를 올린다

한 번 설정:

1. 이 저장소 Secrets: `SUPABASE_ACCESS_TOKEN`(supabase.com → Account → Access Tokens), `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`
2. Supabase → Edge Functions → Secrets: `DDUGIT_LICENSE_PRIVATE_KEY`(ddugit `scripts/license.mjs keygen`이 만든 PEM 전체), `DDUGIT_LICENSE_PUBKEY`(같은 키의 공개키, ddugit 저장소 Variables와 같은 값)
3. 판매(Lemon Squeezy):
   1. 상품 하나: Single payment, `$29`(`site.ts`의 `PRO_PRICE`와 같게). 수량 선택을 켜면 한 주문이 기기 3대 × 수량이 된다
   2. Settings → Webhooks → 추가: URL `https://<project-ref>.supabase.co/functions/v1/ls-webhook`, 이벤트 `order_created`·`order_refunded`, Signing secret은 임의의 긴 값
   3. Supabase → Edge Functions → Secrets: `LEMONSQUEEZY_WEBHOOK_SECRET` = 위 Signing secret. 선택: `LEMONSQUEEZY_PRODUCT_ID` = 상품 id(다른 상품 주문은 무시)
   4. 상품 → Share → 체크아웃 링크(`https://<store>.lemonsqueezy.com/buy/<variant-uuid>`)를 Netlify 환경 변수 `NEXT_PUBLIC_LS_CHECKOUT_URL`에 넣고 다시 배포한다. 없으면 가격 페이지 버튼은 "Available soon"
   5. 상품의 Confirmation modal → Button link(결제 후 이동)를 `https://ddugit.com/thanks`로
   6. 테스트 모드로 한 번 사 본다: 계정 페이지에 "Test order"로 보이면 끝. 지우기는 `delete from public.licenses where store_test;`

구매 흐름: 가격 페이지 → `/checkout`(로그인 안 했으면 로그인 후 돌아옴) → Lemon Squeezy 체크아웃(`checkout[email]`·`checkout[custom][email]`에 로그인 이메일) → 웹훅이 그 이메일로 라이선스 행을 만든다 → `/thanks` → 앱의 설정 → License → "Sign in with ddugit.com". 결제 이메일을 바꿔도 라이선스는 로그인 이메일(`custom_data.email`)로 간다
