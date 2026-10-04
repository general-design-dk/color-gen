import ColoringApp, { type AppState } from "@/components/ColoringApp";

const STATES: AppState[] = ["idle", "loading", "done", "error"];

// `/?state=idle|loading|done|error` 로 상태를 강제 표시한다 (기본 idle)
export default async function Home(props: PageProps<"/">) {
  const { state } = await props.searchParams;
  const value = Array.isArray(state) ? state[0] : state;
  const initialState = STATES.find((s) => s === value) ?? "idle";

  return <ColoringApp key={initialState} initialState={initialState} />;
}
