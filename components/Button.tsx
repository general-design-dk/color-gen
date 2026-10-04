import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex w-full items-center justify-center gap-space-xs whitespace-nowrap rounded-full transition-colors disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  // 만들기: 옐로우 + 블랙, 64px. 비활성은 surface + disabled 텍스트
  primary:
    "h-16 px-space-lg text-button bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover disabled:bg-surface disabled:text-text-disabled",
  // 보조(다운로드·인쇄·돌아가기): 흰 배경 + 테두리, 48px
  secondary:
    "h-12 px-space-sm text-body bg-bg text-text border border-border hover:bg-surface disabled:text-text-disabled",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export default function Button({ variant = "primary", className = "", type = "button", ...rest }: Props) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}
