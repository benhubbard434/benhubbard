import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main
      className="flex-1 flex items-center justify-center min-h-screen px-4"
      style={{
        background:
          "linear-gradient(135deg, var(--color-blue) 0%, var(--color-tomato-jam) 100%)",
      }}
    >
      <ContactForm />
    </main>
  );
}
