import { AuthForm } from "@/features/auth/auth-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center px-4 py-10">
      <AuthForm mode="register" />
    </div>
  );
}
