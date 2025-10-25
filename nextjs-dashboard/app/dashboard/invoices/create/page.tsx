import Form from "@/app/ui/invoices/create-form";

import { fetchCustomers } from "@/app/lib/data";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: "Invoices",
            href: "/dashboard/invoices",
          },
          {
            label: "Create Invoice",
            href: "/dashboard/invoices/create",
            active: true,
          },
        ]}
      />

      <Form customers={customers} />
    </main>
  );
}
