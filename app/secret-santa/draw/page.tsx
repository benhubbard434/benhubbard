import { getStore, hasSession } from "@/lib/secret-santa/server";
import DrawClient from "./DrawClient";

export default async function DrawPage() {
  // Without the password, a visitor learns nothing, not even whether the
  // draw has happened. A personal link (read in the browser) skips this.
  const member = await hasSession("member");
  const status = !member ? "locked" : (await getStore().pairs()).length > 0 ? "drawn" : "waiting";
  return <DrawClient status={status} />;
}
