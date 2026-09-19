import { VendorAuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center px-4 py-10">
      <VendorAuthForm mode="login" />
    </div>
  );
}
