import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEMO_EMAIL = "admin@gmail.com";
const DEMO_PASSWORD = "Admin@123";

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (error) {
      return NextResponse.json(
        { error: "Demo login failed. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
