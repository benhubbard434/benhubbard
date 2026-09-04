import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style — Ben Hubbard",
  description: "Colour, type and motion guidelines for benhubbard.co.uk.",
};

const palette = [
  { hex: "#C4392C", name: "Tomato Jam", token: "--color-tomato-jam", use: "Menu overlay", ink: "#fff" },
  { hex: "#111111", name: "Onyx", token: "--color-onyx", use: "Body text", ink: "#fff" },
  { hex: "#FFFFFF", name: "White", token: "--color-white", use: "Page ground", ink: "#111", ruled: true },
  { hex: "#04F06A", name: "Spring Green", token: "--color-spring-green", use: "Accent", ink: "#111" },
  { hex: "#470FF4", name: "Blue", token: "--color-blue", use: "Blog categories", ink: "#fff" },
];

const typefaces = [
  {
    sample: "Aa",
    name: "Archivo",
    detail: "Black 900 · Italic",
    className: "font-display",
    use: "Display. Page titles, section headings and the wordmark. Tracked to −0.06em, with word-spacing put back so multi-word headings stay legible.",
  },
  {
    sample: "Aa",
    name: "Instrument Serif",
    detail: "Regular 400",
    className: "font-subhead",
    use: "Subheadings. Every h3 and h4, providing the contrast against the display face that a second weight of the same family could not.",
  },
  {
    sample: "Aa",
    name: "Google Sans Flex",
    detail: "Variable 100–1000",
    className: "",
    use: "Body. Running text, navigation, labels and controls. Variable, so every weight in use ships in a single file.",
  },
];

// Rendered through the real utility classes, not a var() lookup — @theme inline
// bakes these values into the utilities rather than emitting custom properties.
// Each step carries the face it actually renders in: h1/h2 take the display
// face, h3 and h4 take the serif, matching the element rules in globals.css.
const scale = [
  { token: "text-display", cls: "text-display", face: "font-display", faceName: "Archivo", sample: "Ben", clamp: "clamp(3.5rem, 2rem + 8vw, 8rem)", leading: "0.95", use: "Hero" },
  { token: "text-h1", cls: "text-h1", face: "font-display", faceName: "Archivo", sample: "Ben Hubbard", clamp: "clamp(2.5rem, 1.5rem + 4vw, 4.5rem)", leading: "1.05", use: "Page title" },
  { token: "text-h2", cls: "text-h2", face: "font-display", faceName: "Archivo", sample: "Ben Hubbard", clamp: "clamp(1.875rem, 1.5rem + 1.9vw, 3rem)", leading: "1.1", use: "Section" },
  { token: "text-h3", cls: "text-h3", face: "font-subhead", faceName: "Instrument Serif", sample: "Ben Hubbard", clamp: "clamp(1.5rem, 1.3rem + 1vw, 1.875rem)", leading: "1.15", use: "Subsection" },
  { token: "text-h4", cls: "text-h4", face: "font-subhead", faceName: "Instrument Serif", sample: "Ben Hubbard", clamp: "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)", leading: "1.2", use: "Minor heading" },
];

const motion = [
  { label: "Micro", value: "70–150ms", use: "Blinks, colour and opacity shifts" },
  { label: "State", value: "200–300ms", use: "Hover, focus, icon rotation" },
  { label: "Panels", value: "315–420ms", use: "Drawers opening and closing" },
  { label: "Overlay", value: "550ms", use: "Full-screen menu" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-h2 mb-8">{children}</h2>
  );
}

export default function StylePage() {
  return (
    <main className="w-full pt-16">
      {/* Intro */}
      <header className="max-w-3xl mx-auto w-full px-6 mb-20">
        <h1 className="font-display text-display mb-6">Style</h1>
        <p className="text-lg text-gray-600 max-w-[60ch]">
          The colour, type and motion this site is built from. Everything below is
          pulled from the same tokens the pages themselves use, so this page and the
          site cannot drift apart.
        </p>
      </header>

      {/* Colour */}
      <section className="mb-20">
        <div className="max-w-3xl mx-auto w-full px-6">
          <SectionHeading>Colour</SectionHeading>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {palette.map((c) => (
            <li
              key={c.hex}
              className="flex flex-col items-center justify-center gap-2 px-4 py-14"
              style={{
                backgroundColor: c.hex,
                color: c.ink,
                boxShadow: c.ruled ? "inset 0 0 0 1px rgba(0,0,0,0.12)" : undefined,
              }}
            >
              <span className="text-2xl font-medium tracking-tight tabular-nums">
                {c.hex.replace("#", "")}
              </span>
              <span className="text-sm" style={{ opacity: 0.75 }}>
                {c.name}
              </span>
              <span className="text-xs mt-3" style={{ opacity: 0.55 }}>
                {c.use}
              </span>
            </li>
          ))}
        </ul>
        <div className="max-w-3xl mx-auto w-full px-6 mt-6">
          <p className="text-sm text-gray-500">
            Available as CSS custom properties:{" "}
            {palette.map((c, i) => (
              <span key={c.token}>
                <code className="text-gray-700">{c.token}</code>
                {i < palette.length - 1 ? ", " : ""}
              </span>
            ))}
            .
          </p>
        </div>
      </section>

      {/* Typography */}
      <section className="max-w-3xl mx-auto w-full px-6 mb-20">
        <SectionHeading>Typography</SectionHeading>
        <ul className="divide-y divide-gray-200 border-t border-gray-200">
          {typefaces.map((t) => (
            <li key={t.name} className="flex gap-6 py-8 items-baseline">
              <span
                className={`${t.className} shrink-0 w-24 leading-none`}
                style={{ fontSize: "3.5rem" }}
                aria-hidden
              >
                {t.sample}
              </span>
              <div>
                <p className="text-lg font-medium">{t.name}</p>
                <p className="text-sm text-gray-500 mb-2">{t.detail}</p>
                <p className="text-sm text-gray-600 max-w-[52ch]">{t.use}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Scale */}
      <section className="max-w-3xl mx-auto w-full px-6 mb-20">
        <SectionHeading>Scale</SectionHeading>
        <p className="text-sm text-gray-600 mb-8 max-w-[60ch]">
          Five fluid steps, roughly a 1.25&ndash;1.6 ratio apart, each set so its
          smallest size clears a 375px viewport without overflowing. The top three
          take the display face; h3 and h4 switch to the serif, which is where the
          hierarchy changes voice rather than just size. Resize the window and the
          specimens below move with it.
        </p>
        <ul className="flex flex-col gap-8">
          {scale.map((s) => (
            <li key={s.token} className="border-t border-gray-200 pt-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                <code className="text-sm text-gray-700">{s.token}</code>
                <span className="text-xs text-gray-400">{s.use}</span>
                <span className="text-xs text-gray-400">{s.faceName}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  line-height {s.leading}
                </span>
              </div>
              <p className={`${s.face} ${s.cls}`}>{s.sample}</p>
              <code className="block text-xs text-gray-400 mt-3">{s.clamp}</code>
            </li>
          ))}
        </ul>
      </section>

      {/* Motion */}
      <section className="max-w-3xl mx-auto w-full px-6 mb-24">
        <SectionHeading>Motion</SectionHeading>
        <p className="text-sm text-gray-600 mb-8 max-w-[60ch]">
          One easing curve carries the whole site &mdash; a decisive ease-out that
          settles rather than bounces. Exits run at roughly three quarters of their
          entrance, since a closing panel should get out of the way.
        </p>
        <code className="block text-sm text-gray-700 border border-gray-200 rounded px-4 py-3 mb-8">
          cubic-bezier(0.16, 1, 0.3, 1)
        </code>
        <ul className="divide-y divide-gray-200 border-t border-gray-200">
          {motion.map((m) => (
            <li key={m.label} className="flex flex-wrap items-baseline gap-x-4 py-4">
              <span className="w-20 shrink-0 text-sm font-medium">{m.label}</span>
              <code className="text-sm text-gray-700 w-28 shrink-0 tabular-nums">{m.value}</code>
              <span className="text-sm text-gray-500">{m.use}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600 mt-8 max-w-[60ch]">
          Every animation on the site has a{" "}
          <code className="text-gray-700">prefers-reduced-motion</code> alternative.
          Panels snap open instead of sliding, and the decorative spins stop entirely.
        </p>
      </section>
    </main>
  );
}
