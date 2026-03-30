import { minDelay } from "@/lib/min-delay";

export default async function PublicTemplate({ children }: { children: React.ReactNode }) {
  await minDelay();
  return children;
}
