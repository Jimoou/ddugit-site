import type { Metadata } from "next";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "이용약관" };

export default function Terms() {
  return (
    <div className="page prose">
      <h1>이용약관</h1>
      <p className="note">초안입니다. 판매를 시작하기 전에 확정합니다.</p>
      <h2>1. 사용 범위</h2>
      <p>
        개인, 학생, 오픈소스 프로젝트는 무료로 쓸 수 있습니다. 회사 업무나 수익 활동에 쓰려면 사용자마다 상업용
        라이선스가 필요합니다.
      </p>
      <h2>2. 구독과 해지</h2>
      <p>
        상업용 라이선스는 월간 또는 연간 구독입니다. 해지하면 결제한 기간이 끝날 때까지 쓸 수 있고 다음 결제는 일어나지
        않습니다.
      </p>
      <h2>3. 환불</h2>
      <p>결제 후 7일 안에 요청하면 전액 환불합니다.</p>
      <h2>4. 책임의 한계</h2>
      <p>ddugit은 사용자의 컴퓨터에 설치된 Git을 실행합니다. 중요한 저장소는 늘 원격에 백업해 두기를 권합니다.</p>
      <h2>문의</h2>
      <p>
        <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
      </p>
    </div>
  );
}
