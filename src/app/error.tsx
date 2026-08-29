'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <>
      <h1>Something went wrong</h1>
      <p>We could not load the catalogue. Please try again in a moment.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </>
  );
}
