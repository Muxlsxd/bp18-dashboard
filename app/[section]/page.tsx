import { notFound } from "next/navigation";
import { getCollectionMeta } from "@/lib/collections";
import { GenericTable } from "@/components/GenericTable";
import Shell from "@/components/Shell";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const meta = getCollectionMeta(section);
  if (!meta) notFound();
  return (
    <Shell>
      <GenericTable meta={meta} />
    </Shell>
  );
}
