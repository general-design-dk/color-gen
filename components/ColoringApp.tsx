"use client";

import { useState } from "react";
import Header from "./Header";
import Canvas from "./Canvas";
import KeywordForm from "./KeywordForm";
import ResultActions from "./ResultActions";
import Toast from "./Toast";

export type AppState = "idle" | "loading" | "done" | "error";

const SAMPLE_IMAGE = "/assets/placeholder-sample.svg";
const ERROR_MESSAGE = "색칠공부에 어울리는 키워드를 입력해 주세요 🙂";

// ?state= 로 강제 표시할 때 보여줄 예시 입력값
const INITIAL_KEYWORD: Record<AppState, string> = {
  idle: "",
  loading: "공룡",
  done: "공룡",
  error: "뉴욕 사진",
};

export default function ColoringApp({ initialState }: { initialState: AppState }) {
  const [state, setState] = useState<AppState>(initialState);
  const [keyword, setKeyword] = useState(INITIAL_KEYWORD[initialState]);

  // 에러는 대기 화면 + 토스트 (userflow §2)
  const canvasState = state === "error" ? "idle" : state;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-space-lg px-space-md py-space-xl md:gap-space-xl md:px-space-xl">
      <Header />

      <section className="grid grid-cols-1 gap-space-lg rounded-card border border-border bg-bg p-space-lg md:grid-cols-2 md:items-center md:gap-space-xl">
        <Canvas state={canvasState} imageSrc={SAMPLE_IMAGE} keyword={keyword} />

        <div className="flex min-w-0 flex-col gap-space-md">
          {state === "done" ? (
            <>
              <p className="text-subtitle-mobile md:text-subtitle text-text">
                <strong className="font-bold">‘{keyword}’</strong> 도안이 완성됐어요!
              </p>
              <p className="text-caption text-text-sub">저장하거나 바로 인쇄해서 색칠해 보세요.</p>
              <ResultActions
                onDownload={() => {}}
                onPrint={() => {}}
                onReset={() => {
                  setKeyword("");
                  setState("idle");
                }}
              />
            </>
          ) : (
            <KeywordForm
              value={keyword}
              loading={state === "loading"}
              onChange={(v) => {
                setKeyword(v);
                if (state === "error") setState("idle");
              }}
              onSubmit={() => {
                // 실제 생성은 STEP 6
              }}
            />
          )}
        </div>
      </section>

      {state === "error" && <Toast message={ERROR_MESSAGE} />}
    </main>
  );
}
