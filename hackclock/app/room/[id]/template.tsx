import { minDelay } from "@/lib/min-delay";

export default async function RoomTemplate({ children }: { children: React.ReactNode }) {
  await minDelay();
  return children;
}
