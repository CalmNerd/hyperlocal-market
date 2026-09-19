"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { loginRequest, registerVendor } from "./api";

export function VendorAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState(mode === "login" ? "vendor@example.com" : "");
  const [password, setPassword] = useState(mode === "login" ? "Password123!" : "");
  const [shopName, setShopName] = useState("");
  const [latitude, setLatitude] = useState("30.3165");
  const [longitude, setLongitude] = useState("78.0322");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const result =
        mode === "login"
          ? await loginRequest(email, password)
          : await registerVendor({
              email,
              password,
              shopName,
              latitude: Number(latitude),
              longitude: Number(longitude),
            });

      if (result.user.role !== "VENDOR") {
        throw new Error("Use the customer or admin app for that account");
      }

      setSession(result);
      router.replace("/products");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-3xl border bg-background/80 p-6 shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Vendor login" : "Open your shop"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New shops need admin approval before they can sell.
        </p>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {mode === "register" && (
        <>
          <div>
            <Label htmlFor="shopName">Shop name</Label>
            <Input id="shopName" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lat">Lat</Label>
              <Input id="lat" required value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lng">Lng</Label>
              <Input id="lng" required value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Please wait…" : mode === "login" ? "Log in" : "Register"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            First time?{" "}
            <Link href="/register" className="underline">
              Register your shop
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
