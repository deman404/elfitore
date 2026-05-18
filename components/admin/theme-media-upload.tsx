"use client"

import { useCallback, useRef, useState } from "react"
import { ImageIcon, Loader2, Trash2, Upload, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "error"; message: string }

export function ThemeMediaUpload({
  value,
  onChange,
  accept = "image/*,video/*",
  folder = "general",
  label = "Média",
  showPreview = true,
}: {
  value: string
  onChange: (url: string) => void
  accept?: string
  folder?: string
  label?: string
  showPreview?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>({ status: "idle" })

  const isVideo = (url: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(url)
  const isImage = (url: string) => /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(url)

  const handleFile = useCallback(
    async (file: File) => {
      setState({ status: "uploading", progress: 0 })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      try {
        const res = await fetch("/api/admin/upload-theme-asset", {
          method: "POST",
          body: formData,
        })

        const data = (await res.json()) as { url?: string; error?: string }

        if (!res.ok || data.error) {
          setState({ status: "error", message: data.error ?? "Upload failed." })
          return
        }

        if (data.url) {
          onChange(data.url)
          setState({ status: "idle" })
        }
      } catch {
        setState({ status: "error", message: "Network error during upload." })
      }
    },
    [folder, onChange]
  )

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) void handleFile(file)
    },
    [handleFile]
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void handleFile(file)
      e.target.value = ""
    },
    [handleFile]
  )

  const clear = () => {
    onChange("")
    setState({ status: "idle" })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {value && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-xs text-red-500 transition hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
            Supprimer
          </button>
        )}
      </div>

      {value && showPreview ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {isVideo(value) ? (
            <video src={value} controls className="max-h-48 w-full object-contain" />
          ) : isImage(value) ? (
            <img src={value} alt="Preview" className="max-h-48 w-full object-contain" />
          ) : (
            <div className="flex h-32 items-center justify-center gap-2 text-sm text-slate-500">
              <Upload className="h-4 w-4" />
              {value}
            </div>
          )}
        </div>
      ) : null}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 transition hover:border-[#2271b1] hover:bg-[#2271b1]/5"
      >
        {state.status === "uploading" ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-[#2271b1]" />
            <p className="mt-2 text-sm font-medium text-slate-600">Téléversement...</p>
          </>
        ) : state.status === "error" ? (
          <>
            <p className="text-sm font-medium text-red-600">{state.message}</p>
            <p className="mt-1 text-xs text-slate-500">Cliquez pour réessayer</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-slate-400">
              <ImageIcon className="h-5 w-5" />
              <Video className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Cliquez ou glissez un fichier ici
            </p>
            <p className="text-xs text-slate-400">Image ou vidéo, max 50 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {value && !isImage(value) && !isVideo(value) ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="admin-input" placeholder="https://..." />
      ) : null}
    </div>
  )
}
