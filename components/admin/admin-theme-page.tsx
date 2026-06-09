"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import {
  Check,
  ChevronDown,
  Clapperboard,
  Droplets,
  Eye,
  Flower2,
  Globe,
  Image as ImageIcon,
  Leaf,
  Loader2,
  Maximize2,
  Pencil,
  Recycle,
  Save,
  ShieldCheck,
  Sparkles,
  Truck,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ThemeMediaUpload } from "@/components/admin/theme-media-upload"
import { fetchThemeHero, isValidThemeHeroText, type ThemeHeroData } from "@/lib/theme-hero"
import {
  DEFAULT_THEME_FEATURE_SECTION,
  fetchThemeFeatureSection,
  type ThemeFeatureSectionData,
} from "@/lib/theme-feature-section"
import {
  DEFAULT_THEME_TRUST_BADGES,
  TRUST_BADGE_ICON_OPTIONS,
  fetchThemeTrustBadges,
  type ThemeTrustBadgeIcon,
  type ThemeTrustBadgesData,
} from "@/lib/theme-trust-badges"
import {
  DEFAULT_THEME_CTA_BANNER,
  fetchThemeCtaBanner,
  type ThemeCtaBannerData,
} from "@/lib/theme-cta-banner"
import {
  DEFAULT_THEME_HOME_CATEGORIES,
  fetchThemeHomeCategories,
  type ThemeHomeCategoriesData,
} from "@/lib/theme-home-categories"
import {
  DEFAULT_THEME_FOOTER,
  fetchThemeFooter,
  type ThemeFooterData,
} from "@/lib/theme-footer"
import {
  DEFAULT_THEME_MARKETING_PAGES,
  fetchThemeMarketingPages,
  type ThemeMarketingPagesData,
} from "@/lib/theme-marketing-pages"

type MessageState = { type: "error" | "success"; text: string }
type LocaleKey = "en" | "fr" | "ar"
type SectionKey = "hero" | "feature" | "trust" | "cta" | "categories" | "marketing" | "footer"
type ProposLocalizedField =
  | "eyebrow"
  | "title"
  | "subtitle"
  | "intro"
  | "missionTitle"
  | "missionText"
  | "cta"
type OurStoryLocalizedField =
  | "eyebrow"
  | "title"
  | "subtitle"
  | "timelineTitle"
  | "bottomTitle"
  | "bottomText"
  | "cta"
type FeatureLocalizedField =
  | "overlayTitle"
  | "overlayDescription"
  | "topTitle"
  | "topSubtitle"
  | "topBullet1"
  | "topBullet2"
  | "topBullet3"
  | "sectionEyebrow"
  | "sectionTitle"
  | "sectionDescription"
  | "bottomEyebrow"
  | "bottomTitle"
type CtaLocalizedField = "title1" | "title2" | "leaf" | "flower" | "globe"

const localeLabels: Record<LocaleKey, string> = { en: "English", fr: "Français", ar: "العربية" }
const locales: LocaleKey[] = ["en", "fr", "ar"]

const trustIconMap: Record<ThemeTrustBadgeIcon, typeof Leaf> = {
  leaf: Leaf,
  droplets: Droplets,
  sparkles: Sparkles,
  flower: Flower2,
  recycle: Recycle,
  globe: Globe,
  shield: ShieldCheck,
  truck: Truck,
}

export function AdminThemePage() {
  const [hero, setHero] = useState<ThemeHeroData>({
    mediaType: "video",
    mediaUrl: "",
    subtitle: { en: "", fr: "", ar: "" },
    title1: { en: "", fr: "", ar: "" },
    title2: { en: "", fr: "", ar: "" },
    description: { en: "", fr: "", ar: "" },
    cta: { en: "", fr: "", ar: "" },
    scroll: { en: "", fr: "", ar: "" },
  })
  const [feature, setFeature] = useState<ThemeFeatureSectionData>(DEFAULT_THEME_FEATURE_SECTION)
  const [trust, setTrust] = useState<ThemeTrustBadgesData>(DEFAULT_THEME_TRUST_BADGES)
  const [cta, setCta] = useState<ThemeCtaBannerData>(DEFAULT_THEME_CTA_BANNER)
  const [categories, setCategories] = useState<ThemeHomeCategoriesData>(DEFAULT_THEME_HOME_CATEGORIES)
  const [marketingPages, setMarketingPages] = useState<ThemeMarketingPagesData>(DEFAULT_THEME_MARKETING_PAGES)
  const [footer, setFooter] = useState<ThemeFooterData>(DEFAULT_THEME_FOOTER)

  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null)
  const [messages, setMessages] = useState<Partial<Record<SectionKey, MessageState>>>({})
  const [activePanel, setActivePanel] = useState<SectionKey | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [h, f, t, c, categoriesData, marketingData] = await Promise.all([
        fetchThemeHero(),
        fetchThemeFeatureSection(),
        fetchThemeTrustBadges(),
        fetchThemeCtaBanner(),
        fetchThemeHomeCategories(),
        fetchThemeMarketingPages(),
      ])
      const footerData = await fetchThemeFooter()
      setHero(h)
      setFeature(f)
      setTrust(t)
      setCta(c)
      setCategories(categoriesData)
      setMarketingPages(marketingData)
      setFooter(footerData)
      setLoading(false)
    }
    void load()
  }, [])

  const setMessage = (section: SectionKey, msg: MessageState | null) => {
    setMessages((prev) => ({ ...prev, [section]: msg ?? undefined }))
  }

  const handleSave = async (section: SectionKey, endpoint: string, payload: unknown) => {
    setSavingSection(section)
    setMessage(section, null)

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = (await res.json().catch(() => ({}))) as { error?: string }
    if (!res.ok) {
      setMessage(section, { type: "error", text: data.error ?? "Erreur de sauvegarde." })
    } else {
      setMessage(section, { type: "success", text: "Modifications enregistrées." })
    }
    setSavingSection(null)
  }

  const isSaving = (s: SectionKey) => savingSection === s

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Éditeur de page d'accueil</h2>
          <p className="text-sm text-slate-500">
            Modifiez les sections de la page d'accueil comme dans un constructeur de page.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Eye className="h-4 w-4" />
          Aperçu du site
        </a>
      </div>

      {/* Canvas */}
      <div className="space-y-4">
        <SectionCard
          index={1}
          title="Hero"
          description="Bannière principale avec vidéo ou image"
          loading={loading}
          active={activePanel === "hero"}
          onEdit={() => setActivePanel("hero")}
          preview={
            <HeroPreview data={hero} />
          }
        />

        <SectionCard
          index={2}
          title="Section Fonctionnalités"
          description="Grille bento et cartes de présentation"
          loading={loading}
          active={activePanel === "feature"}
          onEdit={() => setActivePanel("feature")}
          preview={<FeaturePreview data={feature} />}
        />

        <SectionCard
          index={3}
          title="Badges de confiance"
          description="Icônes et avantages sous le hero"
          loading={loading}
          active={activePanel === "trust"}
          onEdit={() => setActivePanel("trust")}
          preview={<TrustPreview data={trust} />}
        />

        <SectionCard
          index={4}
          title="Bannière CTA"
          description="Appel à l'action en bas de page"
          loading={loading}
          active={activePanel === "cta"}
          onEdit={() => setActivePanel("cta")}
          preview={<CtaPreview data={cta} />}
        />

        <SectionCard
          index={5}
          title="Catégories d'accueil"
          description="4 cartes éditables entre best sellers et produits"
          loading={loading}
          active={activePanel === "categories"}
          onEdit={() => setActivePanel("categories")}
          preview={<HomeCategoriesPreview data={categories} />}
        />

        <SectionCard
          index={6}
          title="Pages éditables"
          description="À propos et Notre histoire"
          loading={loading}
          active={activePanel === "marketing"}
          onEdit={() => setActivePanel("marketing")}
          preview={<MarketingPagesPreview data={marketingPages} />}
        />

        <SectionCard
          index={7}
          title="Footer"
          description="Liens, description et réseaux sociaux"
          loading={loading}
          active={activePanel === "footer"}
          onEdit={() => setActivePanel("footer")}
          preview={<FooterPreview data={footer} />}
        />
      </div>

      {/* Edit Panels */}
      <EditPanel open={activePanel === "hero"} onClose={() => setActivePanel(null)} title="Modifier le Hero" icon={ImageIcon}>
        <HeroForm
          data={hero}
          setData={setHero}
          onSave={() => {
            if (!hero.mediaUrl.trim()) {
              setMessage("hero", { type: "error", text: "Ajoutez une URL ou un chemin média." })
              return
            }
            const required = [hero.subtitle.en, hero.title1.en, hero.title2.en, hero.description.en, hero.cta.en, hero.scroll.en]
            if (required.some((v) => !isValidThemeHeroText(v))) {
              setMessage("hero", { type: "error", text: "Remplissez tous les champs en anglais." })
              return
            }
            void handleSave("hero", "/api/admin/theme-hero", hero)
          }}
          saving={isSaving("hero")}
          message={messages.hero ?? null}
        />
      </EditPanel>

      <EditPanel open={activePanel === "feature"} onClose={() => setActivePanel(null)} title="Modifier la section Fonctionnalités" icon={Maximize2}>
        <FeatureForm
          data={feature}
          setData={setFeature}
          onSave={() => void handleSave("feature", "/api/admin/theme-feature-section", feature)}
          saving={isSaving("feature")}
          message={messages.feature ?? null}
        />
      </EditPanel>

      <EditPanel open={activePanel === "trust"} onClose={() => setActivePanel(null)} title="Modifier les Badges de confiance" icon={ShieldCheck}>
        <TrustForm
          data={trust}
          setData={setTrust}
          onSave={() => void handleSave("trust", "/api/admin/theme-trust-badges", trust)}
          saving={isSaving("trust")}
          message={messages.trust ?? null}
        />
      </EditPanel>

      <EditPanel open={activePanel === "cta"} onClose={() => setActivePanel(null)} title="Modifier la Bannière CTA" icon={Sparkles}>
        <CtaForm
          data={cta}
          setData={setCta}
          onSave={() => void handleSave("cta", "/api/admin/theme-cta-banner", cta)}
          saving={isSaving("cta")}
          message={messages.cta ?? null}
        />
      </EditPanel>

      <EditPanel open={activePanel === "categories"} onClose={() => setActivePanel(null)} title="Modifier les catégories d'accueil" icon={ImageIcon}>
        <HomeCategoriesForm
          data={categories}
          setData={setCategories}
          onSave={() => void handleSave("categories", "/api/admin/theme-home-categories", categories)}
          saving={isSaving("categories")}
          message={messages.categories ?? null}
        />
      </EditPanel>

      <EditPanel open={activePanel === "marketing"} onClose={() => setActivePanel(null)} title="Modifier les pages éditables" icon={Type}>
        <MarketingPagesForm
          data={marketingPages}
          setData={setMarketingPages}
          onSave={() => void handleSave("marketing", "/api/admin/theme-marketing-pages", marketingPages)}
          saving={isSaving("marketing")}
          message={messages.marketing ?? null}
        />
      </EditPanel>

      <EditPanel open={activePanel === "footer"} onClose={() => setActivePanel(null)} title="Modifier le footer" icon={Globe}>
        <FooterForm
          data={footer}
          setData={setFooter}
          onSave={() => void handleSave("footer", "/api/admin/theme-footer", footer)}
          saving={isSaving("footer")}
          message={messages.footer ?? null}
        />
      </EditPanel>
    </div>
  )
}

/* ───────────────────── Section Card ───────────────────── */

function SectionCard({
  index,
  title,
  description,
  loading,
  active,
  onEdit,
  preview,
}: {
  index: number
  title: string
  description: string
  loading: boolean
  active: boolean
  onEdit: () => void
  preview: React.ReactNode
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-white shadow-sm transition ${
        active ? "border-[#2271b1] ring-1 ring-[#2271b1]" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Button>
      </div>
      <div className="relative bg-slate-50 p-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">Chargement...</div>
        ) : (
          <div className="pointer-events-none select-none opacity-80">{preview}</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <Button size="sm" className="gap-1.5 shadow-lg" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Modifier cette section
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────── Edit Panel Shell ───────────────────── */

function EditPanel({
  open,
  onClose,
  title,
  icon: Icon,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  icon: typeof ImageIcon
  children: React.ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2271b1]/10 text-[#2271b1]">
              <Icon className="h-4 w-4" />
            </div>
            <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

/* ───────────────────── Previews ───────────────────── */

function HeroPreview({ data }: { data: ThemeHeroData }) {
  const text = data.title1.en || data.title2.en || "Titre du hero"
  return (
    <div className="relative overflow-hidden rounded-md bg-slate-900 text-white">
      <div className="flex h-32 items-center justify-center">
        {data.mediaType === "video" ? (
          <Clapperboard className="h-8 w-8 text-white/30" />
        ) : (
          <ImageIcon className="h-8 w-8 text-white/30" />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-white/60">{data.subtitle.en || "Sous-titre"}</p>
        <p className="mt-1 text-sm font-semibold">{text}</p>
        <div className="mt-2 inline-flex rounded bg-white/20 px-2 py-1 text-[10px] font-medium">{data.cta.en || "CTA"}</div>
      </div>
    </div>
  )
}

function FeaturePreview({ data }: { data: ThemeFeatureSectionData }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 row-span-2 flex h-20 items-center justify-center rounded-md bg-slate-200 text-xs text-slate-500">Image gauche</div>
        <div className="flex h-9 items-center justify-center rounded-md bg-slate-200 text-[10px] text-slate-500">Image haut</div>
        <div className="flex h-9 items-center justify-center rounded-md bg-slate-200 text-[10px] text-slate-500">Image bas</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {data.cards.map((card, i) => (
          <div key={i} className="rounded-md bg-white p-2 text-center shadow-sm">
            <p className="truncate text-[10px] font-medium text-slate-700">{card.title.en || `Carte ${i + 1}`}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrustPreview({ data }: { data: ThemeTrustBadgesData }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {data.badges.map((badge, i) => {
        const Icon = trustIconMap[badge.icon] ?? Leaf
        return (
          <div key={i} className="rounded-md bg-white p-3 text-center shadow-sm">
            <Icon className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-1 truncate text-[10px] font-medium text-slate-700">{badge.title.en || `Badge ${i + 1}`}</p>
          </div>
        )
      })}
    </div>
  )
}

function CtaPreview({ data }: { data: ThemeCtaBannerData }) {
  return (
    <div className="relative overflow-hidden rounded-md bg-slate-800 text-white">
      <div className="flex h-28 items-center justify-center">
        <ImageIcon className="h-8 w-8 text-white/20" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-sm font-semibold">{data.title1.en || "Titre CTA"}</p>
        <p className="text-xs text-white/70">{data.title2.en || "Sous-titre"}</p>
      </div>
    </div>
  )
}

function HomeCategoriesPreview({ data }: { data: ThemeHomeCategoriesData }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {data.cards.map((card, index) => (
        <div key={index} className="overflow-hidden rounded-md bg-white shadow-sm">
          <div className="flex h-20 items-center justify-center bg-slate-200">
            <ImageIcon className="h-5 w-5 text-slate-400" />
          </div>
          <div className="p-2">
            <p className="truncate text-[10px] font-medium text-slate-700">{card.title.en || `Catégorie ${index + 1}`}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketingPagesPreview({ data }: { data: ThemeMarketingPagesData }) {
  return (
    <div className="grid gap-2">
      <div className="rounded-md bg-white p-3 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">À propos</p>
        <p className="mt-1 truncate text-xs font-medium text-slate-700">{data.propos.title.en || "About page"}</p>
      </div>
      <div className="rounded-md bg-white p-3 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Our Story</p>
        <p className="mt-1 truncate text-xs font-medium text-slate-700">{data.ourStory.title.en || "Story page"}</p>
      </div>
    </div>
  )
}

function FooterPreview({ data }: { data: ThemeFooterData }) {
  return (
    <div className="grid gap-2">
      <div className="rounded-md bg-white p-3 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brand</p>
        <p className="mt-1 truncate text-xs font-medium text-slate-700">{data.brandName || "Brand name"}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-white p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Shop</p>
          <p className="mt-1 text-xs font-medium text-slate-700">{data.shopLinks[0]?.name.en || "Shop link"}</p>
        </div>
        <div className="rounded-md bg-white p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Links</p>
          <p className="mt-1 text-xs font-medium text-slate-700">{data.usefulLinks[0]?.name.en || "Useful link"}</p>
        </div>
        <div className="rounded-md bg-white p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Support</p>
          <p className="mt-1 text-xs font-medium text-slate-700">{data.supportLinks[0]?.name.en || "Support link"}</p>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────── Hero Form ───────────────────── */

function HeroForm({
  data,
  setData,
  onSave,
  saving,
  message,
}: {
  data: ThemeHeroData
  setData: React.Dispatch<React.SetStateAction<ThemeHeroData>>
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  const update = (field: keyof Omit<ThemeHeroData, "mediaType" | "mediaUrl">, locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: e.target.value } }))

  return (
    <div className="space-y-6">
      <Collapsible title="Média" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setData((p) => ({ ...p, mediaType: "image" }))}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition ${
              data.mediaType === "image" ? "border-[#2271b1] bg-[#2271b1]/5 text-[#2271b1]" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ImageIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Image</span>
          </button>
          <button
            type="button"
            onClick={() => setData((p) => ({ ...p, mediaType: "video" }))}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition ${
              data.mediaType === "video" ? "border-[#2271b1] bg-[#2271b1]/5 text-[#2271b1]" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Clapperboard className="h-6 w-6" />
            <span className="text-sm font-medium">Vidéo</span>
          </button>
        </div>
        <ThemeMediaUpload
          value={data.mediaUrl}
          onChange={(url) => setData((p) => ({ ...p, mediaUrl: url }))}
          folder="hero"
          label={data.mediaType === "video" ? "Vidéo du hero" : "Image du hero"}
        />
      </Collapsible>

      <Collapsible title="Textes localisés" defaultOpen>
        {locales.map((locale) => (
          <div key={locale} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
            <div className="space-y-3">
              <Input label="Sous-titre" value={data.subtitle[locale]} onChange={update("subtitle", locale)} />
              <Input label="Titre ligne 1" value={data.title1[locale]} onChange={update("title1", locale)} />
              <Input label="Titre ligne 2" value={data.title2[locale]} onChange={update("title2", locale)} />
              <Textarea label="Description" value={data.description[locale]} onChange={update("description", locale)} />
              <Input label="Bouton CTA" value={data.cta[locale]} onChange={update("cta", locale)} />
              <Input label="Label scroll" value={data.scroll[locale]} onChange={update("scroll", locale)} />
            </div>
          </div>
        ))}
      </Collapsible>

      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  )
}

/* ───────────────────── Feature Form ───────────────────── */

function FeatureForm({
  data,
  setData,
  onSave,
  saving,
  message,
}: {
  data: ThemeFeatureSectionData
  setData: React.Dispatch<React.SetStateAction<ThemeFeatureSectionData>>
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  const update = (field: FeatureLocalizedField, locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: e.target.value } }))

  const updateCard = (index: number, field: "title" | "description", locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        cards: prev.cards.map((c, i) => (i === index ? { ...c, [field]: { ...c[field], [locale]: e.target.value } } : c)),
      }))

  return (
    <div className="space-y-6">
      <Collapsible title="Images" defaultOpen>
        <div className="grid gap-4">
          <ThemeMediaUpload value={data.leftImageUrl} onChange={(url) => setData((p) => ({ ...p, leftImageUrl: url }))} folder="features" label="Image gauche (bento)" />
          <ThemeMediaUpload value={data.topImageUrl} onChange={(url) => setData((p) => ({ ...p, topImageUrl: url }))} folder="features" label="Image haut (bento)" />
          <ThemeMediaUpload value={data.bottomImageUrl} onChange={(url) => setData((p) => ({ ...p, bottomImageUrl: url }))} folder="features" label="Image bas (bento)" />
          <ThemeMediaUpload value={data.videoImageUrl} onChange={(url) => setData((p) => ({ ...p, videoImageUrl: url }))} folder="features" label="Image vidéo" />
        </div>
      </Collapsible>

      <Collapsible title="Textes bento" defaultOpen>
        {locales.map((locale) => (
          <div key={locale} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
            <div className="space-y-3">
              <Input label="Titre overlay" value={data.overlayTitle[locale]} onChange={update("overlayTitle", locale)} />
              <Textarea label="Description overlay" value={data.overlayDescription[locale]} onChange={update("overlayDescription", locale)} />
              <Input label="Titre haut" value={data.topTitle[locale]} onChange={update("topTitle", locale)} />
              <Input label="Sous-titre haut" value={data.topSubtitle[locale]} onChange={update("topSubtitle", locale)} />
              <Input label="Puce 1" value={data.topBullet1[locale]} onChange={update("topBullet1", locale)} />
              <Input label="Puce 2" value={data.topBullet2[locale]} onChange={update("topBullet2", locale)} />
              <Input label="Puce 3" value={data.topBullet3[locale]} onChange={update("topBullet3", locale)} />
              <Input label="Eyebrow bas" value={data.bottomEyebrow[locale]} onChange={update("bottomEyebrow", locale)} />
              <Input label="Titre bas" value={data.bottomTitle[locale]} onChange={update("bottomTitle", locale)} />
            </div>
          </div>
        ))}
      </Collapsible>

      <Collapsible title="Textes section" defaultOpen>
        {locales.map((locale) => (
          <div key={locale} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
            <div className="space-y-3">
              <Input label="Eyebrow" value={data.sectionEyebrow[locale]} onChange={update("sectionEyebrow", locale)} />
              <Input label="Titre" value={data.sectionTitle[locale]} onChange={update("sectionTitle", locale)} />
              <Textarea label="Description" value={data.sectionDescription[locale]} onChange={update("sectionDescription", locale)} />
            </div>
          </div>
        ))}
      </Collapsible>

      <Collapsible title="Cartes" defaultOpen>
        {data.cards.map((card, idx) => (
          <div key={idx} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Carte {idx + 1}</p>
            <div className="space-y-3">
              {locales.map((locale) => (
                <div key={locale} className="space-y-2">
                  <Input label={`Titre ${localeLabels[locale]}`} value={card.title[locale]} onChange={updateCard(idx, "title", locale)} />
                  <Textarea label={`Description ${localeLabels[locale]}`} value={card.description[locale]} onChange={updateCard(idx, "description", locale)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Collapsible>

      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  )
}

/* ───────────────────── Trust Form ───────────────────── */

function TrustForm({
  data,
  setData,
  onSave,
  saving,
  message,
}: {
  data: ThemeTrustBadgesData
  setData: React.Dispatch<React.SetStateAction<ThemeTrustBadgesData>>
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  const updateBadge = (index: number, field: "title" | "description", locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        badges: prev.badges.map((b, i) => (i === index ? { ...b, [field]: { ...b[field], [locale]: e.target.value } } : b)),
      }))

  const updateIcon = (index: number) => (e: ChangeEvent<HTMLSelectElement>) =>
    setData((prev) => ({
      ...prev,
      badges: prev.badges.map((b, i) => (i === index ? { ...b, icon: e.target.value as ThemeTrustBadgeIcon } : b)),
    }))

  return (
    <div className="space-y-6">
      {data.badges.map((badge, idx) => {
        const Icon = trustIconMap[badge.icon] ?? Leaf
        return (
          <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-white text-slate-500 shadow-sm">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Badge {idx + 1}</p>
            </div>
            <div className="space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-600">Icône</span>
                <select value={badge.icon} onChange={updateIcon(idx)} className="admin-input">
                  {TRUST_BADGE_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {locales.map((locale) => (
                <div key={locale} className="space-y-2">
                  <Input label={`Titre ${localeLabels[locale]}`} value={badge.title[locale]} onChange={updateBadge(idx, "title", locale)} />
                  <Textarea label={`Description ${localeLabels[locale]}`} value={badge.description[locale]} onChange={updateBadge(idx, "description", locale)} />
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  )
}

/* ───────────────────── CTA Form ───────────────────── */

function CtaForm({
  data,
  setData,
  onSave,
  saving,
  message,
}: {
  data: ThemeCtaBannerData
  setData: React.Dispatch<React.SetStateAction<ThemeCtaBannerData>>
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  const update = (field: CtaLocalizedField, locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: e.target.value } }))

  return (
    <div className="space-y-6">
      <Collapsible title="Image de fond" defaultOpen>
        <ThemeMediaUpload value={data.backgroundImageUrl} onChange={(url) => setData((p) => ({ ...p, backgroundImageUrl: url }))} folder="cta" label="Image de fond" />
      </Collapsible>

      <Collapsible title="Textes localisés" defaultOpen>
        {locales.map((locale) => (
          <div key={locale} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
            <div className="space-y-3">
              <Input label="Titre ligne 1" value={data.title1[locale]} onChange={update("title1", locale)} />
              <Input label="Titre ligne 2" value={data.title2[locale]} onChange={update("title2", locale)} />
              <Input label="Ligne feuille" value={data.leaf[locale]} onChange={update("leaf", locale)} />
              <Input label="Ligne fleur" value={data.flower[locale]} onChange={update("flower", locale)} />
              <Input label="Ligne globe" value={data.globe[locale]} onChange={update("globe", locale)} />
            </div>
          </div>
        ))}
      </Collapsible>

      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  )
}

function HomeCategoriesForm({
  data,
  setData,
  onSave,
  saving,
  message,
}: {
  data: ThemeHomeCategoriesData
  setData: React.Dispatch<React.SetStateAction<ThemeHomeCategoriesData>>
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  const update = (cardIndex: number, field: "title" | "description", locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        cards: prev.cards.map((card, index) =>
          index === cardIndex ? { ...card, [field]: { ...card[field], [locale]: e.target.value } } : card
        ),
      }))

  const updateImage = (cardIndex: number) => (url: string) =>
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, index) => (index === cardIndex ? { ...card, imageUrl: url } : card)),
    }))

  return (
    <div className="space-y-6">
      <Collapsible title="Cartes de catégories" defaultOpen>
        {data.cards.map((card, index) => (
          <div key={index} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3 last:mb-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Carte {index + 1}</p>
            <div className="space-y-4">
              <ThemeMediaUpload
                value={card.imageUrl}
                onChange={updateImage(index)}
                folder="home-categories"
                label="Image de la catégorie"
              />
              {locales.map((locale) => (
                <div key={locale} className="space-y-3 rounded-lg border border-slate-100 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
                  <Input label="Titre" value={card.title[locale]} onChange={update(index, "title", locale)} />
                  <Textarea label="Description" value={card.description[locale]} onChange={update(index, "description", locale)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Collapsible>

      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  )
}

function MarketingPagesForm({
  data,
  setData,
  onSave,
  saving,
  message,
}: {
  data: ThemeMarketingPagesData
  setData: React.Dispatch<React.SetStateAction<ThemeMarketingPagesData>>
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  const updatePropos =
    (field: ProposLocalizedField, locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        propos: {
          ...prev.propos,
          [field]: { ...prev.propos[field], [locale]: e.target.value },
        },
      }))

  const updateOurStory =
    (field: OurStoryLocalizedField, locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        ourStory: {
          ...prev.ourStory,
          [field]: { ...prev.ourStory[field], [locale]: e.target.value },
        },
      }))

  const updateFeatureTitle =
    (index: number, locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        propos: {
          ...prev.propos,
          featureTitles: prev.propos.featureTitles.map((item, featureIndex) =>
            featureIndex === index ? { ...item, title: { ...item.title, [locale]: e.target.value } } : item
          ),
        },
      }))

  const updateStep =
    (index: number, field: "title" | "body", locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        ourStory: {
          ...prev.ourStory,
          steps: prev.ourStory.steps.map((item, stepIndex) =>
            stepIndex === index ? { ...item, [field]: { ...item[field], [locale]: e.target.value } } : item
          ),
        },
      }))

  return (
    <div className="space-y-6">
      <Collapsible title="Page À propos" defaultOpen>
        {locales.map((locale) => (
          <div key={locale} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
            <div className="space-y-3">
              <Input label="Eyebrow" value={data.propos.eyebrow[locale]} onChange={updatePropos("eyebrow", locale)} />
              <Textarea label="Titre" value={data.propos.title[locale]} onChange={updatePropos("title", locale)} />
              <Textarea label="Sous-titre" value={data.propos.subtitle[locale]} onChange={updatePropos("subtitle", locale)} />
              <Textarea label="Introduction" value={data.propos.intro[locale]} onChange={updatePropos("intro", locale)} />
              <Input label="Titre mission" value={data.propos.missionTitle[locale]} onChange={updatePropos("missionTitle", locale)} />
              <Textarea label="Texte mission" value={data.propos.missionText[locale]} onChange={updatePropos("missionText", locale)} />
              <Input label="Bouton CTA" value={data.propos.cta[locale]} onChange={updatePropos("cta", locale)} />
            </div>
          </div>
        ))}

        <Collapsible title="Cartes de valeur" defaultOpen={false}>
          {data.propos.featureTitles.map((feature, index) => (
            <div key={index} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3 last:mb-0">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Carte {index + 1}</p>
              {locales.map((locale) => (
                <div key={locale} className="mb-3 rounded-lg border border-slate-100 bg-white p-3 last:mb-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
                  <Input label="Titre" value={feature.title[locale]} onChange={updateFeatureTitle(index, locale)} />
                </div>
              ))}
            </div>
          ))}
        </Collapsible>
      </Collapsible>

      <Collapsible title="Page Notre histoire" defaultOpen>
        {locales.map((locale) => (
          <div key={locale} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
            <div className="space-y-3">
              <Input label="Eyebrow" value={data.ourStory.eyebrow[locale]} onChange={updateOurStory("eyebrow", locale)} />
              <Textarea label="Titre" value={data.ourStory.title[locale]} onChange={updateOurStory("title", locale)} />
              <Textarea label="Sous-titre" value={data.ourStory.subtitle[locale]} onChange={updateOurStory("subtitle", locale)} />
              <Input label="Titre section" value={data.ourStory.timelineTitle[locale]} onChange={updateOurStory("timelineTitle", locale)} />
              <Input label="Titre bas" value={data.ourStory.bottomTitle[locale]} onChange={updateOurStory("bottomTitle", locale)} />
              <Textarea label="Texte bas" value={data.ourStory.bottomText[locale]} onChange={updateOurStory("bottomText", locale)} />
              <Input label="Bouton CTA" value={data.ourStory.cta[locale]} onChange={updateOurStory("cta", locale)} />
            </div>
          </div>
        ))}

        <Collapsible title="Étapes">
          {data.ourStory.steps.map((step, index) => (
            <div key={index} className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3 last:mb-0">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Étape {index + 1}</p>
              {locales.map((locale) => (
                <div key={locale} className="mb-3 rounded-lg border border-slate-100 bg-white p-3 last:mb-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
                  <Input label="Titre" value={step.title[locale]} onChange={updateStep(index, "title", locale)} />
                  <Textarea label="Texte" value={step.body[locale]} onChange={updateStep(index, "body", locale)} />
                </div>
              ))}
            </div>
          ))}
        </Collapsible>
      </Collapsible>

      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  )
}

function FooterForm({
  data,
  setData,
  onSave,
  saving,
  message,
}: {
  data: ThemeFooterData
  setData: React.Dispatch<React.SetStateAction<ThemeFooterData>>
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  const updateText =
    (field: "description" | "copyright", locale: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [locale]: e.target.value },
      }))

  const updateLink =
    (group: "shopLinks" | "usefulLinks" | "supportLinks", index: number, field: "name" | "href", locale?: LocaleKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({
        ...prev,
        [group]: prev[group].map((link, linkIndex) => {
          if (linkIndex !== index) return link
          if (field === "href") {
            return { ...link, href: e.target.value }
          }
          if (!locale) return link
          return {
            ...link,
            name: { ...link.name, [locale]: e.target.value },
          }
        }),
      }))

  const updateSocial =
    (field: keyof ThemeFooterData["socialLinks"]) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: e.target.value,
        },
      }))

  const renderLinkGroup = (title: string, group: "shopLinks" | "usefulLinks" | "supportLinks") => (
    <Collapsible title={title} defaultOpen>
      <div className="space-y-4">
        {data[group].map((link, index) => (
          <div key={index} className="rounded-lg border border-slate-100 bg-white p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Lien {index + 1}</p>
            <div className="space-y-3">
              <Input label="URL" value={link.href} onChange={updateLink(group, index, "href")} />
              {locales.map((locale) => (
                <Input
                  key={locale}
                  label={`Nom ${localeLabels[locale]}`}
                  value={link.name[locale]}
                  onChange={updateLink(group, index, "name", locale)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Collapsible>
  )

  return (
    <div className="space-y-6">
      <Collapsible title="Brand et texte" defaultOpen>
        <div className="space-y-3">
          <Input label="Nom de marque" value={data.brandName} onChange={(e) => setData((prev) => ({ ...prev, brandName: e.target.value }))} />
          {locales.map((locale) => (
            <div key={locale} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{localeLabels[locale]}</p>
              <div className="space-y-3">
                <Textarea label="Description" value={data.description[locale]} onChange={updateText("description", locale)} />
                <Input label="Copyright" value={data.copyright[locale]} onChange={updateText("copyright", locale)} />
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Réseaux sociaux" defaultOpen>
        <div className="space-y-3">
          <Input label="Facebook" value={data.socialLinks.facebook} onChange={updateSocial("facebook")} />
          <Input label="Instagram" value={data.socialLinks.instagram} onChange={updateSocial("instagram")} />
          <Input label="TikTok" value={data.socialLinks.tiktok} onChange={updateSocial("tiktok")} />
        </div>
      </Collapsible>

      {renderLinkGroup("Liens boutique", "shopLinks")}
      {renderLinkGroup("Liens utiles", "usefulLinks")}
      {renderLinkGroup("Liens support", "supportLinks")}

      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  )
}

/* ───────────────────── Reusable UI ───────────────────── */

function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input value={value} onChange={onChange} className="admin-input" />
    </label>
  )
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        className="admin-input min-h-32 resize-y leading-6"
        placeholder="Write the content here..."
      />
    </label>
  )
}

function SaveBar({
  onSave,
  saving,
  message,
}: {
  onSave: () => void
  saving: boolean
  message: MessageState | null
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Enregistrer les modifications</p>
          <p className="text-xs text-slate-500">Les changements seront visibles immédiatement sur le site.</p>
        </div>
        <Button onClick={onSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
      {message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}
    </div>
  )
}
