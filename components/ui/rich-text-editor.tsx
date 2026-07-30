"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eye,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListChecks,
  Pencil,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Subscript,
  Superscript,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { tiptapExtensions } from "@/lib/tiptap/extensions"

const SAFE_URL = /^(https?:|mailto:|tel:)/i

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

type Mode = "wysiwyg" | "html" | "preview"

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const lastAppliedValueRef = useRef<string>(value)
  const [mode, setMode] = useState<Mode>("wysiwyg")
  const [htmlDraft, setHtmlDraft] = useState<string>(value)

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      lastAppliedValueRef.current = html
      setHtmlDraft(html)
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[180px] max-h-[400px] overflow-y-auto p-4 rich-text",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value === lastAppliedValueRef.current) return
    lastAppliedValueRef.current = value
    setHtmlDraft(value)
    editor.commands.setContent(value, { emitUpdate: false })
  }, [value, editor])

  // Sync WYSIWYG ↔ HTML draft when switching modes.
  useEffect(() => {
    if (mode === "wysiwyg" && editor) {
      if (htmlDraft !== editor.getHTML()) {
        lastAppliedValueRef.current = htmlDraft
        editor.commands.setContent(htmlDraft, { emitUpdate: false })
        onChange(htmlDraft)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  if (!editor) {
    return (
      <div className="min-h-[220px] w-full rounded-lg border border-zinc-200 bg-zinc-50 animate-pulse" />
    )
  }

  const isWysiwyg = mode === "wysiwyg"
  const isHtml = mode === "html"
  const isPreview = mode === "preview"

  const modeBtn = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs font-semibold",
      active
        ? "bg-zinc-900 text-white"
        : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
    )

  return (
    <div className={cn("w-full rounded-lg border border-zinc-200 bg-white", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("bold") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Bold"
        >
          <Bold className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().toggleItalic().run()}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("italic") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Italic"
        >
          <Italic className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().toggleStrike().run()}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("strike") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().toggleUnderline().run()}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("underline") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Underline"
        >
          <UnderlineIcon className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().toggleHighlight().run()}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("highlight") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Highlight"
        >
          <Highlighter className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().toggleSubscript().run()}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("subscript") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Subscript"
        >
          <Subscript className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().toggleSuperscript().run()}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("superscript") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Superscript"
        >
          <Superscript className="size-4" />
        </button>

        <button
          type="button"
          disabled={!isWysiwyg}
          onClick={() => {
            const previous = editor.getAttributes("code").class as string | undefined
            editor.chain().focus().toggleCode().run()
          }}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("code") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Inline Code"
        >
          <Code2 className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-zinc-300 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("heading", { level: 2 }) && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("heading", { level: 3 }) && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-zinc-300 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("bulletList") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Bullet List"
        >
          <List className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("orderedList") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("blockquote") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("taskList") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Task List"
        >
          <ListChecks className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={!isWysiwyg}
          className="grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40"
          title="Horizontal Rule"
        >
          <div className="w-4 h-0.5 bg-current" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          disabled={!isWysiwyg}
          className="grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40"
          title="Clear Formatting"
        >
          <RemoveFormatting className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-zinc-300 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive({ textAlign: "left" }) && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Align Left"
        >
          <AlignLeft className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive({ textAlign: "center" }) && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Align Center"
        >
          <AlignCenter className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          disabled={!isWysiwyg}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive({ textAlign: "right" }) && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Align Right"
        >
          <AlignRight className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-zinc-300 self-center" />

        <button
          type="button"
          disabled={!isWysiwyg}
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined
            const input = window.prompt("URL (http, https, mailto, tel)", previous ?? "https://")
            if (input === null) return
            const url = input.trim()
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
              return
            }
            if (!SAFE_URL.test(url)) {
              window.alert("URL must start with http, https, mailto, or tel.")
              return
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
          }}
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40",
            editor.isActive("link") && "bg-zinc-200 border-zinc-300 text-zinc-900 font-semibold",
          )}
          title="Insert / edit link"
        >
          <LinkIcon className="size-4" />
        </button>

        <button
          type="button"
          disabled={!isWysiwyg}
          onClick={() => {
            const input = window.prompt("Image URL (http/https)", "https://")
            if (input === null) return
            const url = input.trim()
            if (url === "") return
            if (!/^https?:/i.test(url)) {
              window.alert("Image URL must start with http or https.")
              return
            }
            editor.chain().focus().setImage({ src: url }).run()
          }}
          className="grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40"
          title="Insert image"
        >
          <ImageIcon className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-zinc-300 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().undo().run()}
          className="grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40"
          title="Undo"
        >
          <Undo2 className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!isWysiwyg || !editor.can().chain().focus().redo().run()}
          className="grid size-8 place-items-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40"
          title="Redo"
        >
          <Redo2 className="size-4" />
        </button>

        <div className="ml-auto flex items-center gap-1 border-l border-zinc-300 pl-2">
          <button type="button" className={modeBtn(isWysiwyg)} onClick={() => setMode("wysiwyg")} title="WYSIWYG editor">
            <Pencil className="size-3.5" /> Edit
          </button>
          <button type="button" className={modeBtn(isHtml)} onClick={() => setMode("html")} title="HTML source mode">
            <Code2 className="size-3.5" /> HTML
          </button>
          <button type="button" className={cn(modeBtn(isPreview), "font-bold")} onClick={() => setMode("preview")} title="Preview HTML output">
            <Eye className="size-3.5" /> Preview HTML
          </button>
        </div>
      </div>

      {isWysiwyg ? <EditorContent editor={editor} /> : null}

      {isHtml ? (
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            const html = e.target.value
            setHtmlDraft(html)
            lastAppliedValueRef.current = html
            onChange(html)
          }}
          className="min-h-[220px] w-full resize-y bg-zinc-950 p-4 font-mono text-xs text-emerald-100 outline-none"
          spellCheck={false}
        />
      ) : null}

      {isPreview ? (
        <div
          className="rich-text min-h-[220px] max-h-[500px] overflow-y-auto p-4"
          dangerouslySetInnerHTML={{ __html: htmlDraft }}
        />
      ) : null}
    </div>
  )
}
