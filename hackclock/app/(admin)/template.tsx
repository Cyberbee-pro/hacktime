import { minDelay } from "@/lib/min-delay";

export default async function AdminTemplate({ children }: { children: React.ReactNode }) {
  await minDelay();
  return children;
}
