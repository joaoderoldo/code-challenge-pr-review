import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function Home() {
  if (await isAdmin()) {
    redirect("/admin");
  }
  redirect("/login");
}
