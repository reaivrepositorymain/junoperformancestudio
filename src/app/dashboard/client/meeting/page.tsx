"use client";

import { Clock } from "lucide-react";
import BigCalendar from "@/components/BigCalendar";
import moment from "moment";

// Sample events with colors and multi-day support
const meetings = [
  {
    title: "Client Review",
    start: moment().startOf("day").set({ hour: 10, minute: 0 }).toDate(), // 10:00 AM today
    end: moment().startOf("day").set({ hour: 14, minute: 0 }).toDate(),   // 12:00 PM today
    color: "#E84912",
    allDay: false,
  },
  {
    title: "Design Workshop",
    start: moment().add(1, "days").set({ hour: 12, minute: 0 }).toDate(),
    end: moment().add(1, "days").set({ hour: 14, minute: 0 }).toDate(), // 12pm to 2pm
    color: "#53B36A",
    allDay: false,
  },
  {
    title: "Team Sync",
    start: moment().add(3, "days").set({ hour: 9, minute: 30 }).toDate(),
    end: moment().add(3, "days").set({ hour: 10, minute: 0 }).toDate(),
    color: "#3669B2",
    allDay: false,
  },
  {
    title: "Conference",
    start: moment().add(5, "days").startOf("day").toDate(),
    end: moment().add(7, "days").endOf("day").toDate(),
    color: "#F6A100",
    allDay: true,
  },
  {
    title: "All-Day Task",
    start: moment().add(2, "days").startOf("day").toDate(),
    end: moment().add(2, "days").endOf("day").toDate(),
    color: "#438D34",
    allDay: true,
  },
];

export default function MeetingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 bg-white/80">
        <Clock className="w-6 h-6 text-[#E84912]" />
        <h2 className="text-3xl font-bold text-[#E84912] drop-shadow">Your Calendar</h2>
        <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {meetings.length} events
        </span>
      </div>
      {/* Calendar */}
      <div className="py-4 px-10">
        <BigCalendar meetings={meetings} />
      </div>
    </div>
  );
}