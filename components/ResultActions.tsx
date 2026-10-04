import Button from "./Button";

type Props = { onDownload: () => void; onPrint: () => void; onReset: () => void };

// 완료 상태의 결과 버튼 3개 (실제 다운로드·인쇄는 STEP 6)
export default function ResultActions({ onDownload, onPrint, onReset }: Props) {
  return (
    <div className="grid grid-cols-3 gap-space-xs md:grid-cols-1 md:gap-space-sm">
      <Button variant="secondary" onClick={onDownload}>다운로드</Button>
      <Button variant="secondary" onClick={onPrint}>인쇄</Button>
      <Button variant="secondary" onClick={onReset}>돌아가기</Button>
    </div>
  );
}
