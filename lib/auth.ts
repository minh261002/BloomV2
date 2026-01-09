import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { resend } from "./resend";
import { User } from "@prisma/client";
import {
  generateOTPEmailTemplate,
  generateOTPEmailPlainText,
} from "./email-templates/otp-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // Optional: Use NEXT_PUBLIC_APP_URL for logo URL if available
        // e.g., const logoUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg` : undefined;
        const logoUrl = undefined; // Set to your domain URL + /images/logo.svg when deployed
        
        await resend.emails.send({
          from: "Bloom <onboarding@resend.dev>",
          to: [email],
          subject: "🌸 Mã xác thực OTP của bạn",
          html: generateOTPEmailTemplate(otp, logoUrl),
          text: generateOTPEmailPlainText(otp),
        });
      },
    }),
    admin({
      defaultRole: "USER",
      adminRoles: ["ADMIN"],
    }),
  ],
  callbacks: {
    async redirect({ user }: { user: User }) {
      switch (user.role) {
        case "ADMIN":
          return "/admin/dashboard";
        default:
          return "/";
      }
    },
  },
});
