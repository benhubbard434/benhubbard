import { hasSession } from "@/lib/secret-santa/server";
import Gate from "../Gate";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  if (!(await hasSession("admin"))) return <Gate role="admin" />;
  return <AdminClient />;
}
