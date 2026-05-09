import { AdminShell } from "@/components/admin/admin-shell"

const parameters = [
  {
    label: "Store name",
    value: "El Fitore",
    detail: "Public brand used across the storefront and receipts.",
  },
  {
    label: "Currency",
    value: "USD",
    detail: "Shown in the settings layer and should match checkout pricing.",
  },
  {
    label: "Checkout method",
    value: "Cash on delivery + WhatsApp",
    detail: "Primary fulfillment flow for customer orders.",
  },
  {
    label: "Default language",
    value: "English",
    detail: "Fallback locale when no translation is selected.",
  },
  {
    label: "Admin access",
    value: "Supabase Auth",
    detail: "Authentication gate for the admin workspace.",
  },
]

export default function AdminParametersPage() {
  return (
    <AdminShell
      current="parameters"
      title="Settings"
      description="Review the store-wide defaults behind the admin workspace."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Settings center</p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Store defaults, access, and checkout behavior in one place.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                These values are the current operational defaults. They’re grouped here so it’s obvious what controls the customer experience, even before the fields are wired to editable storage.
              </p>
            </div>

            <div className="grid gap-3">
              <SettingPill label="Mode" value="Read-only" />
              <SettingPill label="Source" value="Constants + Supabase" />
              <SettingPill label="Status" value="Needs wiring" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {parameters.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Next step</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Wire these values to Supabase if you want the settings page to become editable and persist across deployments.
              </p>
            </div>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Ready for integration
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

function SettingPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
