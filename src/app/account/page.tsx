import type { Metadata } from "next";

export const metadata: Metadata = { title: "내 계정" };

export default function Account() {
  return (
    <div className="page prose">
      <h1>내 계정</h1>
      <p>라이선스를 사고 관리하는 곳입니다. 앱을 쓰는 데는 로그인이 필요 없습니다.</p>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        <span className="button" aria-disabled="true">
          GitHub로 로그인
        </span>
        <span className="button" aria-disabled="true">
          Google로 로그인
        </span>
      </div>
      <p className="muted small">로그인은 곧 열립니다.</p>
    </div>
  );
}
