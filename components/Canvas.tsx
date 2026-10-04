import type { AppState } from "./ColoringApp";

type Props = { state: AppState; imageSrc?: string; keyword?: string };

// A4 세로 비율(1:√2) 도안 영역. 인쇄 결과와 같게 항상 흰 배경.
export default function Canvas({ state, imageSrc, keyword }: Props) {
  return (
    <div className="rounded-input bg-surface p-space-md">
      <div className="relative flex aspect-[1/1.4142] w-full items-center justify-center overflow-hidden rounded-input border border-border bg-bg">
        {state === "done" && imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- STEP 6에서 생성 이미지(data URL)로 교체
          <img src={imageSrc} alt={keyword ? `${keyword} 색칠공부 도안` : "색칠공부 도안"} className="h-full w-full object-contain" />
        ) : state === "loading" ? (
          <CanvasMessage icon={<WandIcon />} text="요정이 그리는 중…" busy />
        ) : (
          <CanvasMessage icon={<CrayonIcon />} text="무엇을 그려줄까요?" />
        )}
      </div>
    </div>
  );
}

function CanvasMessage({ icon, text, busy }: { icon: React.ReactNode; text: string; busy?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-space-md px-space-lg text-center" role="status" aria-busy={busy}>
      <div className="h-24 w-24 text-text-sub md:h-32 md:w-32">{icon}</div>
      <p className="text-body text-text-sub">{text}</p>
    </div>
  );
}

function CrayonIcon() {
  return (
    <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <rect x="14" y="10" width="52" height="72" rx="6" />
      <path d="M24 26h32M24 38h24M24 50h28" />
      <path d="M58 86l6-18 20-20a5 5 0 017 7L71 75z" className="fill-primary" />
      <path d="M78 54l7 7" />
    </svg>
  );
}

function WandIcon() {
  return (
    <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M18 80l44-44" />
      <path d="M62 14l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" className="fill-primary" />
      <path d="M30 22v8M26 26h8M80 58v8M76 62h8" />
    </svg>
  );
}
