import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Usage — Ben Hubbard",
  description: "How AI is and isn't used on this site.",
};

/**
 * Placeholder copy. Every string below marked TODO is a claim about how Ben
 * actually works, so it has to be written by him rather than guessed at.
 */
const sections = [
  {
    heading: "How this site is built",
    body: "TODO — write this. What part AI played in building the site itself.",
  },
  {
    heading: "How I use AI in my writing",
    body: "TODO — write this. Whether posts are drafted, edited or checked with AI, and where the line sits.",
  },
  {
    heading: "What I don't use it for",
    body: "TODO — write this. The things you deliberately keep AI out of.",
  },
  {
    heading: "Questions",
    body: "TODO — write this, or drop the section. Where someone should get in touch if they want to know more.",
  },
];

export default function AiUsagePage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-16 pb-8">
      <h1 className="font-display text-h1 mb-6">AI Usage</h1>

      <p className="text-lg text-gray-600 max-w-[60ch] mb-16">
        TODO — write this. A line or two on why this page exists.
      </p>

      {sections.map((section) => (
        <section key={section.heading} className="mb-12">
          <h3 className="text-h3 mb-3">{section.heading}</h3>
          <p className="text-gray-600 max-w-[60ch]">{section.body}</p>
        </section>
      ))}
    </main>
  );
}
