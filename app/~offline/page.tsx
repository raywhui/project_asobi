export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">You are offline</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        ProjectAsobi could not reach the network. Reconnect to keep your character
        sheet and session data in sync.
      </p>
    </main>
  );
}
