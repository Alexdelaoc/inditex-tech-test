import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <h1>{id}</h1>
      <Link href="/">Back to the catalogue</Link>
    </>
  );
}
