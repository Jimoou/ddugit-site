import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { LOGIN_PROVIDERS } from "@/site";
import { type Provider, signIn, signOut } from "./actions";

export const metadata: Metadata = { title: "내 계정" };

const LABEL: Record<Provider, string> = { github: "GitHub로 로그인", google: "Google로 로그인" };

export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const user = hasSupabase() ? (await (await supabaseServer()).auth.getUser()).data.user : null;

  if (!user) {
    return (
      <div className="page prose">
        <h1>내 계정</h1>
        <p>라이선스를 사고 관리하는 곳입니다. 앱을 내려받고 쓰는 데는 로그인이 필요 없습니다.</p>
        {error && <p className="note">로그인하지 못했어요. 다시 시도해 주세요.</p>}
        {hasSupabase() ? (
          <div className="actions" style={{ justifyContent: "flex-start" }}>
            {LOGIN_PROVIDERS.map((p) => (
              <form key={p} action={signIn.bind(null, p)}>
                <button className="button">{LABEL[p]}</button>
              </form>
            ))}
          </div>
        ) : (
          <p className="muted small">로그인은 곧 열립니다.</p>
        )}
      </div>
    );
  }

  const name = (user.user_metadata.full_name ?? user.user_metadata.user_name ?? user.email) as string;
  const { data: licenses } = await (
    await supabaseServer()
  )
    .from("licenses")
    .select("id, kind, plan, seats, status, paid_through, text")
    .order("created_at", { ascending: false });
  return (
    <div className="page prose">
      <h1>내 계정</h1>
      <section className="card">
        <h3>{name}</h3>
        <p>{user.email}</p>
      </section>
      <h2>라이선스</h2>
      {licenses?.length ? (
        licenses.map((l) => (
          <section key={l.id} className="card license">
            <h3>
              {l.kind === "site" ? "사이트 라이선스" : (PLAN[l.plan as string] ?? "상업용")} · {l.seats}명
            </h3>
            <p>
              {l.paid_through ? `${l.paid_through}까지 결제됨` : "기간 없음"} · {STATUS[l.status as string] ?? l.status}
            </p>
            <p className="muted small">
              앱의 설정 → 라이선스에 아래 글을 붙여 넣으세요. 구독이 이어지면 앱이 알아서 갱신합니다.
            </p>
            <textarea className="license-text" readOnly rows={3} value={l.text as string} />
          </section>
        ))
      ) : (
        <p>
          {user.email} 로 산 라이선스가 없습니다. 구독은 곧 열려요. <Link href="/pricing">가격 보기</Link>
        </p>
      )}
      <form action={signOut}>
        <button className="button">로그아웃</button>
      </form>
    </div>
  );
}

const PLAN: Record<string, string> = { monthly: "월간 구독", yearly: "연간 구독" };
const STATUS: Record<string, string> = {
  active: "사용 중",
  on_trial: "체험 중",
  cancelled: "해지됨(기간 끝까지 사용)",
  past_due: "결제 확인 필요",
  expired: "만료",
};
