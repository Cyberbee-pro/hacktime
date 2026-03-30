import { StandbyPageSkeleton } from "@/components/ui/PageSkeletons";
import { Monitor } from "lucide-react";

export default function Loading() {
  return <StandbyPageSkeleton icon={Monitor} />;
}
