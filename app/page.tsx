// STEP 2 임시 화면: 토큰 적용 확인용 (STEP 3에서 교체)
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-space-md px-space-md md:px-space-xl">
      <h1 className="text-display-mobile md:text-display text-text">
        <span className="bg-primary px-space-xs">색칠요정</span>
      </h1>
      <p className="text-subtitle-mobile md:text-subtitle text-text-sub">
        키워드로 만드는 아이용 색칠공부 도안
      </p>
    </main>
  );
}
