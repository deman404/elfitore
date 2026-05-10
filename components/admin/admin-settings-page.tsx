"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Loader2, Lock, MessageSquareMore, Save, Shield, Smartphone } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { fetchSiteSettings, isValidWhatsAppNumber } from "@/lib/site-settings"

type MessageState = {
  type: "error" | "success"
  text: string
}

export function AdminSettingsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [adminEmail, setAdminEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<MessageState | null>(null)
  const [whatsappMessage, setWhatsappMessage] = useState<MessageState | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      setLoadingSettings(true)

      const [{ data: authData }, settings] = await Promise.all([supabase.auth.getUser(), fetchSiteSettings()])

      setAdminEmail(authData.user?.email ?? "")
      setWhatsappNumber(settings.whatsappNumber ?? "")
      setLoadingSettings(false)
    }

    void loadSettings()
  }, [supabase])

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessage(null)

    if (!adminEmail) {
      setPasswordMessage({ type: "error", text: "Sign in again to update the password." })
      return
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Fill in the current password and the new password twice." })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Use a new password with at least 8 characters." })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "The new passwords do not match." })
      return
    }

    setChangingPassword(true)

    const signIn = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: currentPassword,
    })

    if (signIn.error) {
      setPasswordMessage({ type: "error", text: signIn.error.message })
      setChangingPassword(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setPasswordMessage({ type: "error", text: error.message })
    } else {
      setPasswordMessage({ type: "success", text: "Your admin password has been updated." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }

    setChangingPassword(false)
  }

  const handleSaveWhatsapp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWhatsappMessage(null)

    if (!isValidWhatsAppNumber(whatsappNumber)) {
      setWhatsappMessage({
        type: "error",
        text: "Enter a WhatsApp number with the country code and 8 to 15 digits.",
      })
      return
    }

    setSavingWhatsapp(true)

    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ whatsappNumber }),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string; whatsappNumber?: string }

    if (!response.ok) {
      setWhatsappMessage({
        type: "error",
        text: data.error ?? "Could not save the WhatsApp number.",
      })
    } else {
      setWhatsappNumber(data.whatsappNumber ?? whatsappNumber)
      setWhatsappMessage({
        type: "success",
        text: "The WhatsApp number has been saved and will be used for order links.",
      })
    }

    setSavingWhatsapp(false)
  }

  return (
    <AdminShell
      current="settings"
      title="Settings"
      description="Update the admin password and the WhatsApp number used by customer command links."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Admin settings</p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Keep access secure and keep customer command links pointed at the right number.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Password updates use your current Supabase session, and the WhatsApp number is stored centrally so checkout, product pages, and admin flows stay in sync.
              </p>
            </div>

            <div className="grid gap-3">
              <SettingPill label="Account" value={loadingSettings ? "Loading..." : adminEmail || "Not signed in"} />
              <SettingPill label="WhatsApp" value={loadingSettings ? "Loading..." : whatsappNumber || "Not set"} />
              <SettingPill label="Scope" value="Admin-only" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Change password</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Re-enter your current password, then choose a new one for the admin account.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Admin email</span>
                <input value={adminEmail} readOnly className="admin-input bg-slate-50 text-slate-500" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Current password</span>
                <input
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="admin-input"
                  placeholder="Enter your current password"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">New password</span>
                <input
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  className="admin-input"
                  placeholder="Use at least 8 characters"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Confirm new password</span>
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  className="admin-input"
                  placeholder="Repeat the new password"
                />
              </label>

              <Button type="submit" className="w-full gap-2" disabled={changingPassword || !adminEmail}>
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                {changingPassword ? "Updating password..." : "Update password"}
              </Button>

              {passwordMessage ? (
                <Notice type={passwordMessage.type} text={passwordMessage.text} />
              ) : null}
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">WhatsApp command number</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  This number is used when customers tap WhatsApp on product pages, checkout, and the cart modal.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSaveWhatsapp}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">WhatsApp number</span>
                <input
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  className="admin-input"
                  placeholder="+212600000000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                Use the full international format with the country code. The app strips spaces and symbols before building the WhatsApp link.
              </div>

              <Button type="submit" className="w-full gap-2" disabled={savingWhatsapp}>
                {savingWhatsapp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingWhatsapp ? "Saving..." : "Save WhatsApp number"}
              </Button>

              {whatsappMessage ? (
                <Notice type={whatsappMessage.type} text={whatsappMessage.text} />
              ) : null}
            </form>
          </article>
        </section>

        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">How it is used</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Public storefront buttons read the saved number at runtime, so one change here updates all customer-facing WhatsApp links without a redeploy.
                </p>
              </div>
            </div>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Live settings
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

function Notice({ type, text }: MessageState) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {text}
    </div>
  )
}
