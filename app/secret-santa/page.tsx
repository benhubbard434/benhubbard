import { MAX_PARTICIPANTS } from "@/lib/secret-santa/config";
import { getStore, hasSession } from "@/lib/secret-santa/server";
import { drawnSides, SIDE_KEYS } from "@/lib/secret-santa/state";
import Gate from "./Gate";
import { Fir } from "./Motifs";
import SignupForm from "./SignupForm";

export default async function SecretSantaPage() {
  if (!(await hasSession("member"))) return <Gate role="member" />;

  const store = getStore();
  const drawn = drawnSides(await store.pairs());
  const closed = SIDE_KEYS.every((side) => drawn.has(side)) || (await store.list()).length >= MAX_PARTICIPANTS;

  if (closed) {
    return (
      <section className="santa-card santa-center">
        <Fir />
        <p className="santa-eyebrow">Secret Santa</p>
        <h1 className="santa-title">Sign-ups are closed</h1>
        <p className="santa-lede">
          Everyone is in. When the names are drawn, you&rsquo;ll get an email with your own private link.
        </p>
      </section>
    );
  }

  return <SignupForm />;
}
