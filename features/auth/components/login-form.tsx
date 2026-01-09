"use client";

import React, { useState, useTransition } from 'react'
import { ErrorContext } from 'better-auth/react';
import { useAuthWithRecaptcha } from '@/hooks/use-auth-with-recaptcha';
import { useRouter } from 'next/navigation';
import { toast } from "@/lib/toast"


const LoginForm = () => {
    const router = useRouter();
    const { sendVerificationOtpWithRecaptcha, signInSocialWithRecaptcha } = useAuthWithRecaptcha();

    const [isGooglePending, startGoogleTransition] = useTransition();
    const [isEmailPending, startEmailTransition] = useTransition();
    const [email, setEmail] = useState<string>("");


    async function handleGoogleSignIn() {
        startGoogleTransition(async () => {
            try {
                await signInSocialWithRecaptcha({
                    provider: "google",
                    callbackURL: "/api/auth/callback",
                    onSuccess: () => {
                        toast.info("Đang chuyển hướng...");
                    },
                    onError: (error: ErrorContext) => {
                        toast.error(error.error?.message || "Lỗi đăng nhập. Vui lòng thử lại.");
                    },
                });
            } catch {
                toast.error("Lỗi xác thực reCAPTCHA. Vui lòng thử lại.");
            }
        })
    }

    async function handleEmailSignIn() {
        startEmailTransition(async () => {
            try {
                await sendVerificationOtpWithRecaptcha({
                    email: email,
                    type: "sign-in",
                    onSuccess: () => {
                        toast.success("OTP đã được gửi đến email");
                        router.push(`/verify-request?email=${email}`);
                    },
                    onError: (error: ErrorContext) => {
                        toast.error(error.error?.message || "Lỗi gửi OTP");
                    },
                });
            } catch {
                toast.error("Lỗi xác thực reCAPTCHA. Vui lòng thử lại.");
            }
        })
    }
    return (
        <div>
            abc
        </div>
    )
}

export default LoginForm