import StarterKit from "@tiptap/starter-kit"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { CodeBlock } from "@tiptap/extension-code-block"
import { Underline } from "@tiptap/extension-underline"
import { TextAlign } from "@tiptap/extension-text-align"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"

// Single source of truth for the extension list. Client editor, server-side
// generateHTML/generateJSON, and any migration scripts must all import from here
// so the ProseMirror schema stays identical across surfaces.
export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false,
  }),
  Underline,
  TextStyle,
  Color,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Highlight.configure({ multicolor: false }),
  Subscript,
  Superscript,
  TaskList,
  TaskItem.configure({ nested: true }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
    protocols: ["http", "https", "mailto", "tel"],
  }),
  Image.configure({
    inline: false,
    allowBase64: false,
  }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  CodeBlock,
]
