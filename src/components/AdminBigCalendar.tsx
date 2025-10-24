"use client";

import moment from "moment";
import { CalendarDays, List, ChevronLeft, ChevronRight, ArrowBigDown, ArrowDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const VIEW_OPTIONS = [
  { key: "month", icon: <CalendarDays className="w-5 h-5" />, label: "Month" },
  { key: "week", icon: <CalendarDays className="w-5 h-5" />, label: "Week" },
  { key: "day", icon: <CalendarDays className="w-5 h-5" />, label: "Day" },
  { key: "list", icon: <List className="w-5 h-5" />, label: "List" },
];

function getMonthDays(year: number, month: number) {
  const days = [];
  const firstDay = moment([year, month]);
  const lastDay = moment(firstDay).endOf("month");
  let day = moment(firstDay);
  while (day <= lastDay) {
    days.push(day.clone());
    day.add(1, "day");
  }
  return days;
}

function getEventsForDay(day: moment.Moment, meetings: any[]) {
  return meetings.filter(event => {
    const start = moment(event.start);
    const end = moment(event.end);
    return day.isBetween(start, end, "day", "[]");
  });
}

export default function AdminBigCalendar({ meetings }: { meetings: any[] }) {
  const today = moment();
  const [currentMonth, setCurrentMonth] = useState(today.clone().startOf("month"));
  const [selectedDate, setSelectedDate] = useState(today.clone());
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [view, setView] = useState("month");
  const year = currentMonth.year();
  const month = currentMonth.month();
  const days = getMonthDays(year, month);

  const firstWeekday = currentMonth.day();
  const blanks = Array(firstWeekday).fill(null);

  const weekStart = selectedDate.clone().startOf("week");
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, "days"));

  const dayEvents = getEventsForDay(selectedDate, meetings);

  const monthEvents = meetings.filter(event => {
    const start = moment(event.start);
    const end = moment(event.end);
    return (
      start.isSame(currentMonth, "month") ||
      end.isSame(currentMonth, "month") ||
      (start.isBefore(currentMonth.clone().endOf("month")) && end.isAfter(currentMonth.clone().startOf("month")))
    );
  });

  const prevWeek = () => setSelectedDate(selectedDate.clone().subtract(1, "week"));
  const nextWeek = () => setSelectedDate(selectedDate.clone().add(1, "week"));
  const prevDay = () => setSelectedDate(selectedDate.clone().subtract(1, "day"));
  const nextDay = () => setSelectedDate(selectedDate.clone().add(1, "day"));

  return (
    <div className="flex-1 w-full px-2 mx-auto mb-4">
      {/* Controls */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          {view === "month" && (
            <>
              <div className="flex items-center gap-1 ml-4">
                <span className="text-2xl font-semibold text-gray-900 tracking-tighter drop-shadow">
                  {currentMonth.format("MMMM YYYY")}
                </span>
                <DropdownMenu open={monthMenuOpen} onOpenChange={setMonthMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="ml-1 p-1 rounded-full bg-gray-100 hover:bg-[#E84912]/10 text-[#E84912] transition shadow"
                      aria-label="Select Month and Year"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-44">
                    {/* Year selection, each with a nested month menu */}
                    {[...Array(5)].map((_, i) => {
                      const yearOption = today.year() - 2 + i;
                      return (
                        <DropdownMenuSub key={yearOption}>
                          <DropdownMenuSubTrigger
                            className={`font-bold flex justify-between items-center ${yearOption === currentMonth.year() ? "text-[#E84912]" : ""}`}
                          >
                            {yearOption}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-40">
                            {moment.months().map((m, idx) => (
                              <DropdownMenuItem
                                key={m}
                                onClick={() => {
                                  setCurrentMonth(
                                    currentMonth.clone().year(yearOption).month(idx)
                                  );
                                  setMonthMenuOpen(false);
                                }}
                                className={
                                  idx === currentMonth.month() && yearOption === currentMonth.year()
                                    ? "bg-[#E84912]/20 text-[#E84912] font-semibold"
                                    : ""
                                }
                              >
                                {m}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
          {view === "week" && (
            <>
              <button onClick={prevWeek} className="p-2 rounded-lg bg-gray-100 hover:bg-[#E84912]/10 text-[#E84912] transition shadow" aria-label="Previous Week">
                <ChevronLeft />
              </button>
              <span className="text-2xl font-semibold text-gray-900 tracking-tighter drop-shadow">
                Week of {selectedDate.clone().startOf("week").format("MMM D, YYYY")}
              </span>
              <button onClick={nextWeek} className="p-2 rounded-lg bg-gray-100 hover:bg-[#E84912]/10 text-[#E84912] transition shadow" aria-label="Next Week">
                <ChevronRight />
              </button>
            </>
          )}
          {view === "day" && (
            <>
              <button onClick={prevDay} className="p-2 rounded-lg bg-gray-100 hover:bg-[#E84912]/10 text-[#E84912] transition shadow" aria-label="Previous Day">
                <ChevronLeft />
              </button>
              <span className="text-2xl font-semibold text-gray-900 tracking-tighter drop-shadow">
                {selectedDate.format("dddd, MMM D, YYYY")}
              </span>
              <button onClick={nextDay} className="p-2 rounded-lg bg-gray-100 hover:bg-[#E84912]/10 text-[#E84912] transition shadow" aria-label="Next Day">
                <ChevronRight />
              </button>
            </>
          )}
          {view === "list" && (
            <span className="text-2xl font-semibold text-gray-900 tracking-tighter drop-shadow">
              Events List ({currentMonth.format("MMMM YYYY")})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {VIEW_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition
                ${view === opt.key
                  ? "bg-[#E84912] text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-[#E84912]/10 hover:text-[#E84912]"}
              `}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {/* Month View */}
      {view === "month" && (
        <>
          <div className="grid grid-cols-7 gap-0 w-full border-2 rounded-t-sm mt-3 border-gray-200 overflow-hidden bg-white/80 shadow">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
              <div key={d} className="text-center tracking-tighter text-lg font-semibold text-[#E84912] py-2 border-r last:border-r-0 border-gray-200 bg-white/90">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0 w-full border-2 border-gray-200 overflow-hidden bg-white/80 shadow relative">
            {/* Watermark */}
            <img
              src="/resources/favicons/isologos.png"
              alt="Juno Watermark"
              className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-2.5 w-2/3 h-2/3 object-contain z-0"
              style={{ filter: "grayscale(1)" }}
              aria-hidden="true"
            />
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="border-r border-b border-gray-300 bg-white/80" />
            ))}
            {days.map((day) => {
              const isToday = day.isSame(moment(), "day");
              const isSelected = day.isSame(selectedDate, "day");
              const events = getEventsForDay(day, meetings);
              return (
                <button
                  key={day.format("YYYY-MM-DD")}
                  onClick={() => setSelectedDate(day.clone())}
                  className={`aspect-square border-r border-b border-gray-400 flex flex-col items-start justify-start transition
        p-1 relative z-10
        ${isSelected ? "bg-[#E84912]/90 text-white border-[#E84912] shadow-lg z-20" : isToday ? "bg-gray-100 text-[#E84912] font-bold z-10" : "text-gray-900"}
        hover:bg-[#E84912]/10 focus:outline-none`}
                  style={{ minHeight: "70px", minWidth: "70px" }}
                >
                  <span className="text-xl font-semibold">{day.date()}</span>
                  <div className="flex flex-col gap-0.5 mt-1 w-full">
                    {events.map((event, idx) => (
                      <span
                        key={idx}
                        className="block rounded px-1 py-0.5 text-xs font-semibold truncate"
                        style={{
                          background: event.color,
                          color: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                        }}
                        title={`${event.title}\n${event.start ? moment(event.start).format("h:mm A") : ""} - ${event.end ? moment(event.end).format("h:mm A") : ""}\n${event.booking_type?.description || ""}`}
                      >
                        {/* Title */}
                        {event.title}
                        {/* Time */}
                        {event.start && (
                          <span className="block font-normal text-[10px] opacity-80">
                            {moment(event.start).format("h:mm A")}
                            {event.end ? ` - ${moment(event.end).format("h:mm A")}` : ""}
                          </span>
                        )}
                        {/* Members (from booking_type.description or other field) */}
                        {event.booking_type?.description && (
                          <span className="block font-normal text-[10px] opacity-70">
                            {event.booking_type.description}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
      {/* Week View */}
      {view === "week" && (
        <>
          <div className="grid grid-cols-7 gap-0 w-full mt-3 rounded-t-sm border-2 border-gray-200 overflow-hidden bg-white/80 shadow">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
              <div key={d} className="text-center tracking-tighter text-lg font-semibold text-[#E84912] py-2 border-r last:border-r-0 border-gray-200 bg-white/90">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0 w-full border-2 border-gray-200 overflow-hidden bg-white/80 shadow">
            {weekDays.map((day) => {
              const isToday = day.isSame(moment(), "day");
              const isSelected = day.isSame(selectedDate, "day");
              const events = getEventsForDay(day, meetings);
              return (
                <button
                  key={day.format("YYYY-MM-DD")}
                  onClick={() => setSelectedDate(day.clone())}
                  className={`aspect-square border-r border-b border-gray-200 flex flex-col items-start justify-start transition
                    p-1 relative
                    ${isSelected ? "bg-[#E84912]/90 text-white border-[#E84912] shadow-lg z-10" : isToday ? "bg-gray-100 text-[#E84912] font-bold z-10" : "bg-white text-gray-900"}
                    hover:bg-[#E84912]/10 focus:outline-none`}
                  style={{ minHeight: "90px", minWidth: "90px" }}
                >
                  <span className="text-xl font-semibold">{day.date()}</span>
                  <div className="flex flex-col gap-0.5 mt-1 w-full">
                    {events.map((event, idx) => (
                      <span
                        key={idx}
                        className="block rounded px-1 py-0.5 text-xs font-semibold truncate"
                        style={{
                          background: event.color,
                          color: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                        }}
                      >
                        {event.title}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
      {/* Day View - Time View */}
      {view === "day" && (
        <div className="w-full border-2 border-gray-200 rounded-sm mt-3 bg-white/80 shadow p-4 flex flex-col items-start">
          <div className="w-full">
            {/* Time slots: 12am - 11pm */}
            <div className="grid grid-cols-1 gap-0">
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i;
                const slotStart = selectedDate.clone().set({ hour, minute: 0, second: 0, millisecond: 0 });
                const slotEnd = slotStart.clone().add(1, "hour");
                // Show events that overlap with this slot
                const slotEvents = dayEvents.filter(event => {
                  const start = moment(event.start);
                  const end = moment(event.end);
                  return (
                    start.isBefore(slotEnd) &&
                    end.isAfter(slotStart)
                  );
                });
                return (
                  <div key={hour} className="flex items-start border-b last:border-b-0 border-gray-100 py-2 relative group min-h-[40px]">
                    <div className="w-20 text-right pr-4 text-xs text-gray-400 font-mono">{slotStart.format("h A")}</div>
                    <div className="flex-1 min-h-[32px] relative">
                      {slotEvents.length === 0 ? (
                        <span className="text-gray-300 text-xs">—</span>
                      ) : (
                        slotEvents.map((event, idx) => {
                          const eventStart = moment(event.start);
                          const eventEnd = moment(event.end);
                          // Only render the event card at its starting hour
                          if (eventStart.hour() === hour && eventStart.isSame(selectedDate, "day")) {
                            // Calculate duration in hours (max 24)
                            const duration = Math.max(1, Math.min(24, eventEnd.diff(eventStart, "hours", true)));
                            return (
                              <div
                                key={idx}
                                className="absolute left-0 right-0 px-3 py-2 rounded-lg shadow-sm font-semibold text-sm flex flex-col"
                                style={{
                                  background: event.color,
                                  color: "#fff",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                                  top: 0,
                                  height: `${duration * 40}px`, // 40px per hour slot
                                  zIndex: 2,
                                }}
                              >
                                <span>{event.title}</span>
                                <span className="text-xs font-normal opacity-80">
                                  {eventStart.format("h:mm A")} - {eventEnd.format("h:mm A")}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* List View */}
      {view === "list" && (
        <div className="w-full border-2 border-gray-200 rounded-sm mt-3 bg-white/80 shadow p-4 flex flex-col items-start">
          {monthEvents.length === 0 ? (
            <div className="text-gray-500">No events this month.</div>
          ) : (
            <div className="flex flex-col gap-2 py-3 w-full">
              {monthEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-sm"
                  style={{
                    background: event.color,
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  }}
                >
                  <span className="font-bold text-lg">{event.title}</span>
                  <span className="block text-sm mt-1">
                    {moment(event.start).format("MMM D, YYYY h:mm A")} - {moment(event.end).format("MMM D, YYYY h:mm A")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}