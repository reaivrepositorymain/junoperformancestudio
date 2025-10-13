import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in the environment variables.");
}

export async function GET(request: Request) {
    try {
        // Extract the token from cookies
        const cookieHeader = request.headers.get("cookie");
        console.log("Cookies:", cookieHeader);

        const token = cookieHeader
            ?.split("; ")
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            console.error("Token not found in cookies.");
            return NextResponse.json(
                { error: "Unauthorized: Token not found" },
                { status: 401 }
            );
        }

        // Verify the token
        let decoded: jwt.JwtPayload | string;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
            console.log("Decoded Token:", decoded);
        } catch (error) {
            console.error("Invalid token:", error);
            return NextResponse.json(
                { error: "Unauthorized: Invalid token" },
                { status: 401 }
            );
        }

        // Extract userId from the decoded token
        const userId = typeof decoded === "object" && "userId" in decoded ? decoded.userId : null;

        if (!userId) {
            console.error("User ID not found in token.");
            return NextResponse.json(
                { error: "Unauthorized: User ID not found in token" },
                { status: 401 }
            );
        }

        console.log("User ID:", userId);

        // Check if the user exists in the users table
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", userId)
            .single();

        if (userError || !user) {
            console.error("User not found in database:", userError);
            return NextResponse.json(
                { error: "Unauthorized: User not found" },
                { status: 401 }
            );
        }

        console.log("User exists in database:", user);

        // Check if the user has completed the questionnaire
        const { data: questionnaire, error: questionnaireError } = await supabase
            .from("client_questionnaire")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (questionnaireError && questionnaireError.code !== "PGRST116") {
            console.error("Error fetching questionnaire:", questionnaireError);
            return NextResponse.json(
                { error: "Failed to fetch questionnaire status." },
                { status: 500 }
            );
        }

        const hasCompletedQuestionnaire = !!questionnaire;
        console.log("Has completed questionnaire:", hasCompletedQuestionnaire);

        return NextResponse.json({ hasCompletedQuestionnaire });
    } catch (error) {
        console.error("Error checking questionnaire status:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}