import { RECOMMENDED_KEYWORDS } from "@/lib/keywords";

type Props = { value: string; disabled?: boolean; onSelect: (keyword: string) => void };

// 추천 키워드 칩. 모바일은 가로 스크롤, 넓은 화면은 줄바꿈.
export default function KeywordChips({ value, disabled, onSelect }: Props) {
  return (
    <ul className="-mx-space-lg flex gap-space-xs overflow-x-auto px-space-lg md:mx-0 md:flex-wrap md:overflow-visible md:px-0" aria-label="추천 키워드">
      {RECOMMENDED_KEYWORDS.map((k) => {
        const selected = value.trim() === k;
        return (
          <li key={k} className="shrink-0">
            <button
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(k)}
              className={`h-10 rounded-full px-space-md text-body transition-colors disabled:cursor-not-allowed ${
                selected ? "bg-primary text-on-primary" : "bg-surface text-text hover:bg-border disabled:text-text-disabled"
              }`}
            >
              {k}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
