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
  const { comp_email } = await request.json();

  if (!comp_email) {
    return NextResponse.json({ error: "Missing email." }, { status: 400 });
  }

  // Find user by comp_email
  const { data: user } = await supabase
    .from("users")
    .select("id, comp_email, name, cli_email")
    .eq("comp_email", comp_email)
    .single();

  if (!user) {
    // Always return success for security
    return NextResponse.json({ success: true });
  }

  // Generate reset token and expiry
  const token = uuidv4();
  const expires_at = getExpiryDate(48);

  // Save token and expiry to user (status remains active)
  await supabase
    .from("users")
    .update({
      invitation_token: token,
      invitation_expires_at: expires_at
    })
    .eq("id", user.id);

  // Send reset email using nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password/confirm?token=${token}&id=${user.id}`;

  const mailOptions = {
    from: `"Juno Performance Studio" <${process.env.GMAIL_USER}>`,
    to: user.cli_email,
    subject: "Juno Password Reset Request",
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
          <h1>Password Reset Request</h1>
        </div>

        <!-- Content Section -->
        <div class="content">
          <h2>Hello ${user.name || "Client"},</h2>
          <p>You requested to reset your password for your Juno account. Please click the button below to proceed. This link will expire in <span style="color:#E84912;font-weight:bold;">48 hours</span>.</p>
          
          <div class="button-container">
            <a href="${resetLink}" style="color: #fff; text-decoration: none;" class="button">Reset Your Password</a>
          </div>
          
          <p>If you did not request this, you can safely ignore this email. The link will expire and become inactive after 48 hours.</p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
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

  return NextResponse.json({ success: true });
}