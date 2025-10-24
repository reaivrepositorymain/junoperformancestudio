import { NextResponse } from "next/server";

const mockNotifications = [
  {
    id: 1,
    title: "New Booking",
    message: "A new booking has been scheduled.",
    created_at: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    title: "Payment Received",
    message: "You have received a payment.",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    read: true,
  },
  // ...add up to 5 mock notifications
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 5);
  return NextResponse.json({ notifications: mockNotifications.slice(0, limit) });
}