import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { resend } from "./resend";
import { User } from "@prisma/client";

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
        await resend.emails.send({
          from: "Gift VN <onboarding@resend.dev>",
          to: [email],
          subject: "Verify your email",
          html: `<p>Your OTP is ${otp}</p>`,
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
