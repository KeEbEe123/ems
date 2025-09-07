import { Button } from "@/components/ui/button"

export function ParticipantsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">Club - Event Dashboard - Participants Page</h1>
        <div className="flex gap-1">
          <Button variant="default" className="bg-white text-black hover:bg-gray-100 rounded-sm px-4 py-1 text-sm">
            Attendees
          </Button>
          <Button variant="ghost" className="text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm">
            Waitlist
          </Button>
        </div>
      </div>
    </div>
  )
}
