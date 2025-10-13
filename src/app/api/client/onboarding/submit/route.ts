import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in the environment variables.");
}

// Helper to convert JSON to CSV
function jsonToCsv(json: Record<string, any>): string {
    const keys = Object.keys(json);
    const values = keys.map(k => `"${json[k] ?? ""}"`);
    return `${keys.join(",")}\n${values.join(",")}`;
}

export async function POST(request: Request) {
    try {
        // Extract the token from cookies
        const token = request.headers
            .get("cookie")
            ?.split("; ")
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: Token not found" },
                { status: 401 }
            );
        }

        // Verify the token
        let decoded: jwt.JwtPayload | string;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (error) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid token" },
                { status: 401 }
            );
        }

        // Extract userId from the decoded token
        const userId = typeof decoded === "object" && "userId" in decoded ? decoded.userId : null;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized: User ID not found in token" },
                { status: 401 }
            );
        }

        // Parse the request body
        const body = await request.json();

        // Map camelCase keys to snake_case
        const mappedBody = {
            user_id: userId,
            company_name: body.companyName,
            company_age: body.companyAge,
            gender_proportion: body.genderProportion,
            buyers_location: body.buyersLocation,
            audience_aspects: body.audienceAspects,
            other_important: body.otherImportant,
            customer_problem: body.customerProblem,
            most_important_problem: body.mostImportantProblem,
            solution: body.solution,
            differentiators: body.differentiators,
            objections: body.objections,
            most_important_objection: body.mostImportantObjection,
            benchmarks: body.benchmarks,
            competitors: body.competitors,
            competitor_highlights: body.competitorHighlights,
            best_sellers: body.bestSellers,
            priority_products: body.priorityProducts,
            industry_influencers: body.industryInfluencers,
            market_media: body.marketMedia,
            monthly_budget: body.monthlyBudget,
            common_copy: body.commonCopy,
            final_comment: body.finalComment,
            is_espanol: body.isEspanol || false,
        };

        // Insert the questionnaire data into the database
        const { data, error } = await supabase
            .from("client_questionnaire")
            .insert([mappedBody]);

        if (error) {
            console.error("Error inserting questionnaire data:", error);
            return NextResponse.json(
                { error: "Failed to save questionnaire data." },
                { status: 500 }
            );
        }

        // Convert to CSV
        const csvContent = jsonToCsv(mappedBody);

        // Find the "Setup" folder for this user
        const { data: setupFolder, error: folderError } = await supabase
            .from("assets")
            .select("id")
            .eq("user_id", userId)
            .eq("name", "Setup")
            .eq("type", "folder")
            .single();

        if (folderError || !setupFolder) {
            return NextResponse.json({ error: "Setup folder not found." }, { status: 404 });
        }

        // Prepare file path
        const fileName = `onboarding-${Date.now()}.csv`;
        const filePath = `assets/${userId}/${setupFolder.id}/${fileName}`;

        // Upload CSV to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("user-assets")
            .upload(filePath, new Blob([csvContent], { type: "text/csv" }), {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
        }

        // Save metadata to assets table
        await supabase
            .from("assets")
            .insert({
                user_id: userId,
                parent_id: setupFolder.id,
                name: fileName,
                type: "document",
                mimetype: "text/csv",
                size: csvContent.length,
                storage_path: uploadData.path,
            });

        return NextResponse.json({ success: true, message: "Questionnaire submitted and file uploaded." });
    } catch (error) {
        console.error("Error handling onboarding submission:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}