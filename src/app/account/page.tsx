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
  return (
    <div className="page prose">
      <h1>내 계정</h1>
      <section className="card">
        <h3>{name}</h3>
        <p>{user.email}</p>
      </section>
      <h2>라이선스</h2>
      <p>
        아직 상업용 라이선스가 없습니다. 구독은 곧 열려요. <Link href="/pricing">가격 보기</Link>
      </p>
      <form action={signOut}>
        <button className="button">로그아웃</button>
      </form>
    </div>
  );
}
