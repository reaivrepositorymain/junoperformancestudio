import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { sender_id, receiver_id, title, message, type } = await request.json();

  const { data, error } = await supabase
    .from("notifications")
    .insert([{ sender_id, receiver_id, title, message, type }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ notification: data[0] });
}