import { minDelay } from "@/lib/min-delay";

export default async function StageTemplate({ children }: { children: React.ReactNode }) {
  await minDelay();
  return children;
}
