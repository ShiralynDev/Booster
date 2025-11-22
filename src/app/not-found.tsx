import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-3xl font-bold">Page not found (404)</h1>
      <p className="text-muted-foreground text-center max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Go back to home
      </Link>
    </main>
  );
}
