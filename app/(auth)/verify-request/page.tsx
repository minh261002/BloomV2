import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import VerifyRequestForm from "@/features/auth/components/verify-request-form";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    const userRole = session.user.role;
    if (userRole === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <VerifyRequestForm />
    </div>
  );
}
