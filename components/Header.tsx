export default function Header() {
  return (
    <header className="flex flex-col items-center gap-space-xs text-center">
      <h1 className="text-display-mobile md:text-display text-text">
        {/* 글자 아래쪽 절반에 옐로우 형광펜 */}
        <span className="relative inline-block px-space-xs">
          <span aria-hidden className="absolute inset-x-0 bottom-1 h-1/2 bg-primary" />
          <span className="relative">색칠요정</span>
        </span>
      </h1>
      <p className="text-subtitle-mobile md:text-subtitle text-text-sub">
        키워드 하나로 우리 아이 색칠공부 도안을 그려드려요
      </p>
    </header>
  );
}
