"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
} from "lucide-react"

import { cn } from "@/lib/utils"

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[180px] max-h-[400px] overflow-y-auto p-4 rich-text",
      },
    },
  })

  // Sync value from outside if it changes (without causing cursor jump)
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="min-h-[220px] w-full rounded-none border border-slate-200 bg-slate-50 animate-pulse" />
    )
  }

  return (
    <div className={cn("w-full rounded-none border border-slate-200 bg-white", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50",
            editor.isActive("bold") && "bg-slate-200 border-slate-300 text-slate-900 font-semibold"
          )}
          title="Bold"
        >
          <Bold className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={cn(
            "grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50",
            editor.isActive("italic") && "bg-slate-200 border-slate-300 text-slate-900 font-semibold"
          )}
          title="Italic"
        >
          <Italic className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-300 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900",
            editor.isActive("heading", { level: 2 }) && "bg-slate-200 border-slate-300 text-slate-900 font-semibold"
          )}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900",
            editor.isActive("heading", { level: 3 }) && "bg-slate-200 border-slate-300 text-slate-900 font-semibold"
          )}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-300 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900",
            editor.isActive("bulletList") && "bg-slate-200 border-slate-300 text-slate-900 font-semibold"
          )}
          title="Bullet List"
        >
          <List className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900",
            editor.isActive("orderedList") && "bg-slate-200 border-slate-300 text-slate-900 font-semibold"
          )}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-300 self-center ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
          title="Undo"
        >
          <Undo2 className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="grid size-8 place-items-center rounded-none border border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
          title="Redo"
        >
          <Redo2 className="size-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
