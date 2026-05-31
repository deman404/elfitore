"use client"

import { useEffect, useRef, useState } from "react"
import type { MouseEvent } from "react"
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RichTextEditorProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  imageUploadFolder?: string
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  imageUploadFolder = "marketing-pages",
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectionRef = useRef<Range | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value || ""
    }
  }, [value])

  const apply = (command: string, commandValue?: string) => {
    ref.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(ref.current?.innerHTML ?? "")
  }

  const wrapBlock = (tag: "h2" | "blockquote") => {
    ref.current?.focus()
    document.execCommand("formatBlock", false, tag)
    onChange(ref.current?.innerHTML ?? "")
  }

  const insertLink = () => {
    const url = window.prompt("Link URL")
    if (!url) return
    apply("createLink", url)
  }

  const saveSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (ref.current && ref.current.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange()
    }
  }

  const restoreSelection = () => {
    const selection = window.getSelection()
    if (!selection || !selectionRef.current) return false
    selection.removeAllRanges()
    selection.addRange(selectionRef.current)
    return true
  }

  const insertUploadedImage = async (file: File) => {
    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", imageUploadFolder)

      const response = await fetch("/api/admin/upload-theme-asset", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        window.alert(data.error ?? "Image upload failed.")
        return
      }

      ref.current?.focus()
      restoreSelection()
      const imageHtml = `<img src="${data.url}" alt="" class="editor-inline-image" />`
      document.execCommand("insertHTML", false, imageHtml)
      onChange(ref.current?.innerHTML ?? "")
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
          <ToolbarButton label="Heading" onClick={() => wrapBlock("h2")} icon={Heading2} />
          <ToolbarButton label="Bold" onClick={() => apply("bold")} icon={Bold} />
          <ToolbarButton label="Italic" onClick={() => apply("italic")} icon={Italic} />
          <ToolbarButton label="Underline" onClick={() => apply("underline")} icon={Underline} />
          <ToolbarButton label="Bullet list" onClick={() => apply("insertUnorderedList")} icon={List} />
          <ToolbarButton label="Numbered list" onClick={() => apply("insertOrderedList")} icon={ListOrdered} />
          <ToolbarButton label="Quote" onClick={() => wrapBlock("blockquote")} icon={Quote} />
          <ToolbarButton label="Link" onClick={insertLink} icon={Link2} />
          <ToolbarButton
            label={uploadingImage ? "Uploading..." : "Image"}
            onMouseDown={(event) => {
              event.preventDefault()
              saveSelection()
            }}
            onClick={() => fileInputRef.current?.click()}
            icon={ImagePlus}
            disabled={uploadingImage}
          />
          <ToolbarButton label="Clear" onClick={() => apply("removeFormat")} icon={Eraser} />
          <ToolbarButton label="Undo" onClick={() => apply("undo")} icon={Undo2} />
          <ToolbarButton label="Redo" onClick={() => apply("redo")} icon={Redo2} />
        </div>

        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={label}
          data-placeholder={placeholder}
          onInput={() => onChange(ref.current?.innerHTML ?? "")}
          onBlur={() => onChange(ref.current?.innerHTML ?? "")}
          className={cn(
            "rich-text-editor min-h-36 px-4 py-3 text-sm text-slate-900 outline-none",
            "focus-visible:outline-none",
          )}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void insertUploadedImage(file)
            event.target.value = ""
          }}
        />
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  onMouseDown,
  icon: Icon,
  disabled = false,
}: {
  label: string
  onClick: () => void
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void
  icon: typeof Bold
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      onMouseDown={onMouseDown}
      disabled={disabled}
      className="h-8 w-8 rounded-md text-slate-600"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}
