import { TypingTest } from "@/components/typing-test";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Type — Keyst",
  description: "Practice your typing with a calm, focused experience.",
};

export default function TypePage() {
  return <TypingTest />;
}
