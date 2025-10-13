import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { clientId } = body;

        if (!clientId) {
            console.error("Client ID is missing in the request body.");
            return NextResponse.json(
                { error: "Client ID is required" },
                { status: 400 }
            );
        }

        // Create the default folders for the client
        const folderNames = ["Creatives", "Reports", "Setup"];
        const folderInsertions = folderNames.map((name) => ({
            user_id: clientId,
            parent_id: null, // Root-level folders
            name,
            type: "folder",
        }));

        const { data, error } = await supabase
            .from("assets")
            .insert(folderInsertions);

        if (error) {
            console.error("Error creating folders:", error);
            return NextResponse.json(
                { error: "Failed to create folders for the client" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Folders created successfully for the client",
            folders: data,
        });
    } catch (error) {
        console.error("Error assigning client and creating folders:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}