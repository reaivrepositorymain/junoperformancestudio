import { NextResponse } from "next/server";

export async function GET() {
  const TIDYCAL_PERSONAL_TOKEN = process.env.TIDYCAL_PERSONAL_TOKEN;

  if (!TIDYCAL_PERSONAL_TOKEN) {
    return NextResponse.json(
      { error: "TidyCal personal token is missing in the environment variables." },
      { status: 500 }
    );
  }

  try {
    // Fetch bookings
    const bookingsRes = await fetch("https://tidycal.com/api/bookings", {
      headers: {
        Authorization: `Bearer ${TIDYCAL_PERSONAL_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!bookingsRes.ok) {
      const errorData = await bookingsRes.json();
      return NextResponse.json(
        { error: "Failed to fetch bookings from TidyCal.", details: errorData },
        { status: bookingsRes.status }
      );
    }
    const bookingsData = await bookingsRes.json();

    // Fetch booking types
    const typesRes = await fetch("https://tidycal.com/api/booking-types", {
      headers: {
        Authorization: `Bearer ${TIDYCAL_PERSONAL_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!typesRes.ok) {
      const errorData = await typesRes.json();
      return NextResponse.json(
        { error: "Failed to fetch booking types from TidyCal.", details: errorData },
        { status: typesRes.status }
      );
    }
    const typesData = await typesRes.json();

    // Merge booking type info into each booking
    const typesMap = Object.fromEntries(
      (typesData.data || []).map((type: any) => [type.id, type])
    );
    const merged = (bookingsData.data || []).map((booking: any) => ({
      ...booking,
      booking_type: typesMap[booking.booking_type_id] || null,
    }));

    return NextResponse.json({ data: merged });
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json(
      { error: "An error occurred while fetching bookings.", details: errorMessage },
      { status: 500 }
    );
  }
}