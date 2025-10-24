"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import AdminBigCalendar from "@/components/AdminBigCalendar";

export default function MeetingPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await fetch("/api/tidycal/meetings");
                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || "Failed to fetch bookings.");
                    setLoading(false);
                    return;
                }

                const { data } = await response.json();
                const formattedBookings = (data || []).map((booking: any) => ({
                    title: booking.booking_type?.title || "Booking",
                    start: new Date(booking.starts_at),
                    end: new Date(booking.ends_at),
                    color: "#E84912",
                    allDay: false,
                    location: booking.location,
                    meetingUrl: booking.meeting_url,
                    contact: booking.contact,
                    description: booking.booking_type?.description || "",
                }));

                setBookings(formattedBookings);
                setLoading(false);
            } catch (err) {
                setError("An error occurred while fetching bookings.");
                setLoading(false);
            }
        }

        fetchBookings();
    }, []);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 bg-white/80">
                <Clock className="w-6 h-6 text-[#E84912]" />
                <h2 className="text-3xl font-bold text-[#E84912] drop-shadow">Your Calendar</h2>
                <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {loading ? "Loading..." : `${bookings.length} bookings`}
                </span>
            </div>

            {/* Calendar */}
            <div className="py-4 px-10">
                {loading ? (
                    <p className="text-center text-gray-500">Loading bookings...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    <AdminBigCalendar meetings={bookings} />
                )}
            </div>
        </div>
    );
}