import { Skeleton } from "@/components/ui/skeleton"

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 lg:block">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0F3D37] to-[#1E6F5C] p-12">
          <div className="text-center">
            <Skeleton className="mx-auto size-20 rounded-full" />
            <Skeleton className="mx-auto mt-6 h-8 w-48" />
            <Skeleton className="mx-auto mt-3 h-5 w-64" />
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-background px-4 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Skeleton className="mx-auto h-12 w-48 lg:hidden" />
          <Skeleton className="hidden h-8 w-56 lg:block" />
          <div className="mt-8 rounded-xl border bg-card p-8">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
