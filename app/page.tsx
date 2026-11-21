import { redirect } from "next/navigation";

// "/" always opens the dashboard; AuthGate sends people without a session to /login.
export default function HomePage() {
  redirect("/dashboard");
}
