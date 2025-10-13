"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";

const meetings = [
  { title: "Client Review", time: "2:00 PM", date: "Today" },
  { title: "Design Workshop", time: "11:00 AM", date: "Tomorrow" },
  { title: "Team Sync", time: "9:30 AM", date: "Oct 7" },
];

export default function MeetingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Left: Big Calendar */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-[#E84912] mb-6 text-center">Your Calendar</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-2xl w-full shadow-lg"
          />
        </div>
      </div>
      {/* Right: Meetings List */}
      <div className="flex-1 flex flex-col p-8 bg-white rounded-3xl shadow-2xl border-2 border-gray-100 m-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-[#E84912]" />
          <h2 className="text-xl font-bold text-gray-900">Upcoming Meetings</h2>
          <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {meetings.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {meetings.map((meeting, index) => (
            <div
              key={index}
              className="group bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#E84912]/30 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center gap-4"
            >
              <div className="relative p-2 rounded bg-[#E84912]/10 border border-[#E84912]/10 group-hover:bg-[#E84912]/20 group-hover:border-[#E84912]/20 transition-all duration-200">
                <Clock className="w-5 h-5 text-[#E84912]" />
                {index === 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#E84912] transition-colors truncate text-base">
                  {meeting.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {meeting.date}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {meeting.time}
                  </span>
                </div>
              </div>
              <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        {/* Add Meeting Button */}
        <div className="pt-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 hover:border-[#E84912]/50 hover:bg-[#E84912]/5 transition-all duration-200 group active:scale-[0.98]">
            <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-[#E84912]/10 flex items-center justify-center transition-all duration-200 group-hover:rotate-90">
              <span className="text-gray-500 group-hover:text-[#E84912] font-bold text-lg">+</span>
            </div>
            <span className="font-medium text-gray-600 group-hover:text-[#E84912] transition-colors text-base">
              Add Meeting
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}