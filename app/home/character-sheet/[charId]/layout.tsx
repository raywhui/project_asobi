export default function CharSheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="min-h-screen">{children}</section>;
}

// Todo: Bug fixes
// Sidebar notes changes back to default if leaves and comes back. needs to update the default after save
// Spells filters are not working. Fix.
