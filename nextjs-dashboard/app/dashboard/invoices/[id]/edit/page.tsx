import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import Form from "@/app/ui/invoices/edit-form";
import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  console.log("Invoice Edit Page function ran");

  const params = await props.params;
  const id = params.id;

  const [customers, invoice] = await Promise.all([
    fetchCustomers(),
    fetchInvoiceById(id),
  ]);

  console.log(`invoice: ${invoice}`);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: "Invoices",
            href: "/dashboard/invoices",
          },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
          },
        ]}
      />

      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
