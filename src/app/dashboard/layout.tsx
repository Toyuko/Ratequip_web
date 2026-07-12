export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col md:flex-row">
      {children}
    </div>
  );
}
