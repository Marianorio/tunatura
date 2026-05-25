import { Skeleton } from "@/components/ui/skeleton"

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-center">
          <Skeleton className="size-12 rounded-xl" />
        </div>
        <Skeleton className="mx-auto h-6 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
