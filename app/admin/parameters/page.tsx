import { AdminShell } from "@/components/admin/admin-shell"

const parameters = [
  { label: "Store name", value: "El Fitore" },
  { label: "Currency", value: "USD" },
  { label: "Checkout method", value: "Cash on delivery + WhatsApp" },
  { label: "Default language", value: "English" },
  { label: "Admin access", value: "Supabase Auth" },
]

export default function AdminParametersPage() {
  return (
    <AdminShell
      current="parameters"
      title="Parameters"
      description="Adjust the store-wide settings and operational values."
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-border bg-background p-6">
          <h2 className="font-serif text-3xl text-foreground">Store parameters</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            These are the main values that shape the admin experience. We can connect them to Supabase next if you want them editable.
          </p>

          <div className="mt-6 grid gap-3">
            {parameters.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white px-4 py-3">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

