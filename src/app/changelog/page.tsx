import type { Metadata } from "next";

export const metadata: Metadata = { title: "변경 내역" };

const RELEASES: { version: string; date: string; notes: string[] }[] = [
  {
    version: "0.6.0",
    date: "2026-10-04",
    notes: [
      "병합이 섞인 이력도 interactive rebase로 정리",
      "닫히거나 병합된 PR·MR 목록",
      "설정에서 우주 배경·빛 번짐 끄기",
      "Windows 창 버튼과 macOS 신호등을 탭 줄에 통합",
    ],
  },
  { version: "0.5.3", date: "2026-10-04", notes: ["macOS 앱 서명·공증"] },
  {
    version: "0.5.2",
    date: "2026-10-02",
    notes: ["고정 ‘내 저장소’ 탭(⌘/Ctrl+0)", "브랜치 클릭으로 여러 개 고르기", "새 ‘ddu’ 아이콘"],
  },
  {
    version: "0.5.0",
    date: "2026-10-02",
    notes: ["저장소 그룹", "원격별 접기", "가져오기 전용 원격과 push 보호"],
  },
  {
    version: "0.4.0",
    date: "2026-10-02",
    notes: ["여러 저장소 대시보드", "worktree · 서브모듈 · Git LFS"],
  },
  {
    version: "0.3.0",
    date: "2026-10-02",
    notes: ["커밋 요약을 대각선으로", "미리보기 카드", "그래프 90° 회전"],
  },
];

export default function Changelog() {
  return (
    <div className="page prose">
      <h1>변경 내역</h1>
      {RELEASES.map((r) => (
        <section key={r.version}>
          <h2>
            {r.version} <span className="muted small">{r.date}</span>
          </h2>
          <ul>
            {r.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
