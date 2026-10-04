type Props = { message: string };

// 화면 아래 가운데 고정 토스트 (등장 애니메이션은 STEP 7)
export default function Toast({ message }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-space-xl z-10 flex justify-center px-space-md">
      <p role="alert" className="rounded-full bg-toast-bg px-space-lg py-space-sm text-center text-body text-bg shadow-toast">
        {message}
      </p>
    </div>
  );
}
