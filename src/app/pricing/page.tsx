import type { Metadata } from "next";
import { PRICES, SITE, won } from "@/site";

export const metadata: Metadata = { title: "가격" };

export default function Pricing() {
  return (
    <div className="page">
      <h1>가격</h1>
      <p className="muted">모든 기능이 똑같습니다. 무엇에 쓰는지만 다릅니다.</p>
      <section className="grid tight">
        <article className="card">
          <h3>무료</h3>
          <div className="price">0원</div>
          <p>개인 프로젝트, 학생, 오픈소스. 기능 제한 없음.</p>
        </article>
        <article className="card focus">
          <h3>상업용 · 월간</h3>
          <div className="price">{won(PRICES.monthly)}</div>
          <p>사용자 1명, 매월 결제. 언제든 해지할 수 있습니다.</p>
        </article>
        <article className="card focus">
          <h3>상업용 · 연간</h3>
          <div className="price">{won(PRICES.yearly)}</div>
          <p>사용자 1명, 1년 결제. 두 달 무료와 같습니다.</p>
        </article>
        <article className="card">
          <h3>폐쇄망 · 사이트</h3>
          <div className="price">문의</div>
          <p>인터넷이 없는 환경을 위한 오프라인 라이선스.</p>
        </article>
      </section>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        <span className="button primary" aria-disabled="true">
          구매 — 곧 열려요
        </span>
        <a className="button" href={`mailto:${SITE.contact}`}>
          문의하기
        </a>
      </div>
      <p className="muted small">
        회사 업무, 고객사 납품, 유료 서비스 개발에 쓰면 상업용입니다. 가격은 부가세 포함입니다.
      </p>
    </div>
  );
}
