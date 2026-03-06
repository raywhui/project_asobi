export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen flex flex-col items-center">
      {children}
    </section>
  );
}
