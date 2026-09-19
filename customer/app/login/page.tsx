import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center px-4 py-10">
      <AuthForm mode="login" />
    </div>
  );
}
