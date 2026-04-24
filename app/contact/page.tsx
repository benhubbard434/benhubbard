import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main
      className="flex-1 flex items-center justify-center min-h-screen px-4"
      style={{ background: "linear-gradient(135deg, #3b3bd9 0%, #c4392c 100%)" }}
    >
      <ContactForm />
    </main>
  );
}
