import type { Metadata } from "next";
import Link from "next/link";
import DownloadButtons from "@/components/DownloadButtons";

export const metadata: Metadata = { title: "다운로드" };

export default function Download() {
  return (
    <div className="page prose">
      <h1>다운로드</h1>
      <p>
        로그인 없이 바로 내려받습니다. 상업적으로 쓰려면 <Link href="/pricing">라이선스</Link>가 필요합니다.
      </p>
      <DownloadButtons />

      <h2>macOS</h2>
      <p>macOS 11 이상, Apple Silicon과 Intel을 모두 지원합니다. Apple이 확인한(공증된) 앱이라 바로 열립니다.</p>
      <ol className="steps">
        <li>
          내려받은 <code>.dmg</code>를 엽니다.
        </li>
        <li>ddugit 아이콘을 응용 프로그램 폴더로 끌어다 놓습니다.</li>
      </ol>

      <h2>Windows</h2>
      <p>Windows 10 이상(64비트)을 지원합니다.</p>
      <div className="note">
        아직 Windows 코드 서명 인증서가 없어서, 처음 실행할 때 “Windows의 PC 보호” 창이 뜰 수 있습니다.
      </div>
      <ol className="steps">
        <li>
          내려받은 <code>.exe</code>를 실행합니다.
        </li>
        <li>
          “Windows의 PC 보호” 창이 뜨면 <strong>추가 정보</strong>를 누릅니다.
        </li>
        <li>
          <strong>실행</strong>을 누르면 설치가 시작됩니다.
        </li>
      </ol>

      <h2>필요한 것</h2>
      <p>
        컴퓨터에 <a href="https://git-scm.com/downloads">Git</a>이 설치되어 있어야 합니다.
      </p>
    </div>
  );
}
