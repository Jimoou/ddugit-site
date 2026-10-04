import Link from "next/link";
import { SITE } from "@/site";

const FEATURES = [
  {
    title: "그래프가 화면의 중심",
    body: "커밋 그래프를 캔버스에 그리고 확대·회전·미니맵으로 큰 저장소도 한눈에 봅니다.",
  },
  {
    title: "끌어서 병합·rebase",
    body: "브랜치를 다른 브랜치 위로 끌어 놓으면 병합, rebase, cherry-pick을 고를 수 있습니다.",
  },
  {
    title: "목록으로 하는 interactive rebase",
    body: "편집기 없이 순서 바꾸기·합치기·건너뛰기를 고릅니다. 병합이 섞인 이력도 지원합니다.",
  },
  {
    title: "백포트 추적",
    body: "두 브랜치 사이에 아직 반영되지 않은 커밋을 찾아 한 번에 cherry-pick합니다.",
  },
  {
    title: "내 저장소",
    body: "여러 저장소의 브랜치, 앞섬·뒤처짐, 변경 사항을 대시보드 하나에서 훑어봅니다.",
  },
  {
    title: "worktree · 서브모듈 · LFS",
    body: "큰 프로젝트에 필요한 도구가 사이드바에 함께 들어 있습니다.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>{SITE.tagline}</h1>
        <p>
          ddugit은 커밋 그래프를 중심에 둔 macOS·Windows Git 클라이언트입니다. 개인·학생·오픈소스 용도로는 무료입니다.
        </p>
        <div className="actions">
          <Link href="/download" className="button primary">
            다운로드
          </Link>
          <Link href="/pricing" className="button">
            가격 보기
          </Link>
        </div>
      </section>
      <section className="grid">
        {FEATURES.map((f) => (
          <article key={f.title} className="card">
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </section>
      <p className="muted small" style={{ textAlign: "center" }}>
        로그인 없이 내려받고 바로 씁니다. 계정은 상업용 라이선스를 살 때만 필요합니다.
      </p>
    </>
  );
}
