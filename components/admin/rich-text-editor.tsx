"use client"

import { useEffect, useRef } from "react"
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
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

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

  const insertImage = () => {
    const url = window.prompt("Image URL")
    if (!url) return
    apply("insertImage", url)
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
          <ToolbarButton label="Image" onClick={insertImage} icon={ImagePlus} />
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
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  icon: Icon,
}: {
  label: string
  onClick: () => void
  icon: typeof Bold
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className="h-8 w-8 rounded-md text-slate-600"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}
