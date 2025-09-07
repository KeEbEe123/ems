import { Button } from "@/components/ui/button"

export function AfterEventPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-8">Club - Event Dashboard - After Event Page</h1>
        <div className="mb-8">
          <Button className="bg-white text-black hover:bg-gray-100 rounded-sm px-4 py-2 text-sm">
            Event Report Submission
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-4 rounded-full bg-orange-400"></div>
          <div className="h-0.5 w-16 bg-orange-400"></div>
          <div className="h-4 w-4 rounded-full bg-orange-400"></div>
          <div className="h-0.5 w-16 bg-orange-400"></div>
          <div className="h-4 w-4 rounded-full bg-orange-400"></div>
        </div>
      </div>
    </div>
  )
}
