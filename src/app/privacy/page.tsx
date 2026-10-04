import type { Metadata } from "next";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function Privacy() {
  return (
    <div className="page prose">
      <h1>개인정보처리방침</h1>
      <p className="note">초안입니다. 판매를 시작하기 전에 확정합니다.</p>
      <h2>앱</h2>
      <p>
        ddugit 앱은 저장소 내용, 커밋, 파일을 어디에도 보내지 않습니다. 상업용 라이선스를 쓰는 경우에만 라이선스 키를
        갱신하려고 ddugit.com에 연결합니다.
      </p>
      <h2>사이트</h2>
      <p>
        다운로드에는 로그인이 필요 없습니다. 라이선스를 사거나 관리할 때 GitHub 또는 Google 로그인으로 이메일 주소와
        이름을 받습니다.
      </p>
      <h2>결제</h2>
      <p>결제는 결제 대행사가 처리하며, 카드 정보는 ddugit이 받거나 저장하지 않습니다.</p>
      <h2>문의</h2>
      <p>
        <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
      </p>
    </div>
  );
}
