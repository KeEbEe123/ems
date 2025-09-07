import { Button } from "@/components/ui/button"

export function EventInfoPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">Club - Event Dashboard - Event Info Page</h1>
        <div className="flex gap-1">
          <Button variant="default" className="bg-white text-black hover:bg-gray-100 rounded-sm px-4 py-1 text-sm">
            Event Details
          </Button>
          <Button variant="ghost" className="text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm">
            Forms
          </Button>
          <Button variant="ghost" className="text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm">
            Coupons
          </Button>
          <Button variant="ghost" className="text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm">
            Tickets
          </Button>
        </div>
      </div>
    </div>
  )
}
