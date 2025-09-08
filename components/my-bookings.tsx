import React from "react";
import Image from "next/image";

const TicketCard = ({
  title,
  date,
  time,
  seat,
}: {
  title: string;
  date: string;
  time: string;
  seat: string;
}) => {
  return (
    <div className="relative w-full h-64">
      {/* Ticket SVG as background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Image
          src="/elements/ticket.svg"
          alt="Ticket"
          fill
          className="drop-shadow-lg object-contain"
        />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between px-28 md:px-32 py-12 md:py-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-700 mt-2">Date: {date}</p>
        </div>
        <div className="flex justify-between text-sm text-gray-800 mt-auto">
          <span>Time: {time}</span>
          <span>Seat: {seat}</span>
        </div>
      </div>
    </div>
  );
};

function MyBookings() {
  // Sample data for the tickets
  const tickets = [
    {
      id: 1,
      title: "Concert Night",
      date: "2023-12-15",
      time: "19:00",
      seat: "A12",
    },
    {
      id: 2,
      title: "Tech Conference",
      date: "2023-12-20",
      time: "09:00",
      seat: "B7",
    },
    {
      id: 3,
      title: "Art Exhibition",
      date: "2023-12-22",
      time: "14:00",
      seat: "C3",
    },
    {
      id: 4,
      title: "Theater Play",
      date: "2024-01-05",
      time: "18:30",
      seat: "D9",
    },
    {
      id: 5,
      title: "Music Festival",
      date: "2024-01-12",
      time: "16:00",
      seat: "E15",
    },
    {
      id: 6,
      title: "Stand-up Comedy",
      date: "2024-01-18",
      time: "20:00",
      seat: "F22",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8 text-center">My Bookings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            title={ticket.title}
            date={ticket.date}
            time={ticket.time}
            seat={ticket.seat}
          />
        ))}
      </div>
    </div>
  );
}

export default MyBookings;
