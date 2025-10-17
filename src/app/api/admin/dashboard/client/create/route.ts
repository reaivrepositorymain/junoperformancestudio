import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

// Helper to get expiry timestamp (48 hours from now)
function getExpiryDate(hours = 48) {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now.toISOString();
}

export async function POST(request: Request) {
  try {
    const { name, email, clientEmail } = await request.json();

    // Validate required fields
    if (!name || !email || !clientEmail) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Check if client email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("comp_email", clientEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Client email already exists." },
        { status: 409 }
      );
    }

    // Generate invitation token and expiry
    const token = uuidv4();
    const expires_at = getExpiryDate(48);

    // Insert new client into the database with status 'pending'
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          comp_email: clientEmail, // Use the @juno.com email for login
          cli_email: email,        // Client's actual email
          password_hash: "",       // No password yet
          role: "client",
          profile_image: "",
          status: "pending",
          invitation_token: token,
          invitation_expires_at: expires_at,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create client." },
        { status: 500 }
      );
    }

    // Send email with invitation link using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/activate?token=${token}`;

    const mailOptions = {
      from: `"Juno Performance Studio" <${process.env.GMAIL_USER}>`,
      to: email,
      bcc: "raphaelalcantara51@gmail.com",
      subject: "Juno Client Invitation - Activate Your Account",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 2px solid #000; }
        .header { background-color: #000; color: white; padding: 20px; text-align: center; border-bottom: 2px solid #000; }
        .header img { max-width: 100px; margin-bottom: 10px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .content h2 { color: #000; font-size: 20px; margin-bottom: 10px; }
        .content p { margin: 10px 0; font-size: 14px; color: #555; }
        .button-container { text-align: center; margin-top: 20px; }
        .button { display: inline-block; color: #fff; padding: 12px 30px; background-color: #000; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; background-color: #f4f4f4; color: #666; font-size: 12px; border-top: 2px solid #000; }
        .footer p { margin: 5px 0; }
        .footer a { color: #000; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header Section -->
        <div class="header">
          <img src="https://cdn.prod.website-files.com/66ffba2f61749805af940a3e/6755e3d528fe8ae738d8f9ca_JUNO-favicon-1.png" alt="Juno Logo" />
          <h1>Welcome to Juno!</h1>
        </div>

        <!-- Content Section -->
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>You've been invited to join Juno as a client. Please activate your account by clicking the button below. This link will expire in 48 hours.</p>
          
          <div class="button-container">
            <a href="${inviteLink}" style="color: #fff; text-decoration: none;" class="button">Activate Your Account</a>
          </div>
          
          <p>If you do not activate your account within 48 hours, this invitation will expire and your information will be deleted for security.</p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!</p>
        </div>

        <!-- Footer Section -->
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Juno. All rights reserved.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Visit our website</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: "Client invitation sent successfully.",
        userId: newUser.id,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.cli_email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}