import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/projects/acme-corp");
}
