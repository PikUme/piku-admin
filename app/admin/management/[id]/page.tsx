import { ManagementDetail } from "@/domains/admin/management/ui/management-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminManagementDetailPage({ params }: Props) {
  const { id } = await params;
  return <ManagementDetail id={id} />;
}
