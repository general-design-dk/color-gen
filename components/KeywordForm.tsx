"use client";

import Button from "./Button";
import KeywordChips from "./KeywordChips";
import { KEYWORD_MAX_LENGTH } from "@/lib/keywords";

type Props = {
  value: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

// 키워드 입력창 + 추천 칩 + 만들기 버튼
export default function KeywordForm({ value, loading = false, onChange, onSubmit }: Props) {
  const empty = value.trim().length === 0;

  return (
    <form
      className="flex min-w-0 flex-col gap-space-md"
      onSubmit={(e) => {
        e.preventDefault();
        if (!empty && !loading) onSubmit();
      }}
    >
      <label htmlFor="keyword" className="text-caption text-text-sub">
        그리고 싶은 걸 적거나 아래에서 골라 주세요
      </label>
      <input
        id="keyword"
        type="text"
        inputMode="text"
        enterKeyHint="go"
        autoComplete="off"
        placeholder="예: 엄지공주"
        maxLength={KEYWORD_MAX_LENGTH}
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        className="h-18 w-full rounded-input border-2 border-transparent bg-surface px-space-lg text-input-mobile md:text-input text-text outline-none placeholder:text-text-sub focus:border-text disabled:text-text-disabled"
      />
      <KeywordChips value={value} disabled={loading} onSelect={onChange} />
      <Button
        type="submit"
        variant="primary"
        disabled={empty && !loading}
        aria-disabled={empty || loading}
        aria-busy={loading}
        className={`mt-space-xs ${loading ? "pointer-events-none" : ""}`}
      >
        {loading ? "요정이 그리는 중…" : "✨ 만들기"}
      </Button>
    </form>
  );
}
