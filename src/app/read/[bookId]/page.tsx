import ReaderFeature from "@/features/read/[bookId]/ReaderFeature";

export default async function Page({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  return <ReaderFeature bookId={bookId} />;
}
