import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { name, email, clientEmail, password } = await request.json();

    // Validate required fields
    if (!name || !email || !clientEmail || !password) {
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

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new client into the database
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          comp_email: clientEmail, // Use the @juno.com email for login
          cli_email: email,        // Client's actual email
          password_hash,
          role: "client",
          profile_image: "",
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

    // Send email with credentials using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email, // Send to the contact email
      subject: "Welcome to Juno - Your Account Details",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background-color: #000; color: white; padding: 20px; text-align: center; }
            .header img { max-width: 100px; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .content h2 { color: #000; font-size: 20px; margin-bottom: 10px; }
            .content p { margin: 10px 0; font-size: 14px; color: #555; }
            .credentials { background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #000; }
            .credentials p { margin: 5px 0; font-size: 14px; }
            .credentials strong { color: #000; }
            .button-container { text-align: center; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #000; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; }
            .button a { color: white; text-decoration: none; }
            .footer { text-align: center; padding: 20px; background-color: #f4f4f4; color: #666; font-size: 12px; }
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
              <p>We're excited to have you on board! Your client account has been successfully created. Below are your login credentials:</p>
              
              <div class="credentials">
                <p><strong>Login Email:</strong> ${clientEmail}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
              
              <p>Please keep this information secure. You can use these credentials to log in to your account and start exploring our services.</p>
              
              <div class="button-container">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/2.0/login" class="button">Login to Your Account</a>
              </div>
              
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
        message: "Client created successfully and email sent.",
        userId: newUser.id, // Return userId directly
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
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