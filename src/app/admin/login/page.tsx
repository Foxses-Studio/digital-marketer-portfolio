import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { SetupForm } from "@/components/auth/setup-form";
import { routes } from "@/config/routes";
import { hasAnyAdmin } from "@/lib/admins/bootstrap";
import { getCurrentAdmin } from "@/lib/auth/dal";
import { getSettings } from "@/lib/cms/settings";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}

/**
 * Decides on the server, per request, which screen to show:
 * - signed in       → dashboard
 * - no accounts yet → first-install "Create Super Admin"
 * - otherwise       → sign-in form only (no registration of any kind)
 */
async function LoginGate({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  if (await getCurrentAdmin()) redirect(routes.admin.dashboard);

  const [{ siteName }, adminExists, params] = await Promise.all([
    getSettings("site"),
    hasAnyAdmin(),
    searchParams,
  ]);

  if (!adminExists) {
    return (
      <AuthLayout
        siteName={siteName}
        title="Create Super Admin"
        description="Set up the owner account for this website. This screen is shown only once."
      >
        <SetupForm />
      </AuthLayout>
    );
  }

  const next = typeof params.next === "string" ? params.next : undefined;
  return (
    <AuthLayout
      siteName={siteName}
      title="Welcome back"
      description="Sign in to continue to your dashboard."
    >
      <LoginForm next={next} />
    </AuthLayout>
  );
}
