import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-space-md text-center gap-space-lg">
      <div>
        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">TableFlow</p>
        <h1 className="font-display text-display text-on-surface mt-2">L&apos;Ambre</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-md mx-auto">
          Scan a table QR code to open the digital menu, or sign in to run the kitchen dashboard.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md"
        >
          Staff login
        </Link>
        <Link
          href="/t/a0000000-0000-4000-8000-000000000014"
          className="px-6 py-3 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg"
        >
          Demo Table 14 menu
        </Link>
      </div>
    </main>
  );
}
