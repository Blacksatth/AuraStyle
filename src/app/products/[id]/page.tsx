import ProductClient from "@/app/products/[id]/ProductClient";

// Marca la función como async y usa await para params
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <ProductClient id={id} />;
}// También marca generateMetadata como async
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Producto ${id}`,
  };
}

