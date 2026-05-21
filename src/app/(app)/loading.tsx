import { Spinner } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <Spinner className="h-7 w-7 text-primary" />
    </div>
  );
}
