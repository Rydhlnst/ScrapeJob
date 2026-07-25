import StarterKit from "@tiptap/starter-kit"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { CodeBlock } from "@tiptap/extension-code-block"

// Single source of truth for the extension list. Client editor, server-side
// generateHTML/generateJSON, and any migration scripts must all import from here
// so the ProseMirror schema stays identical across surfaces.
export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false, // we register the standalone CodeBlock below
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
    // Reject javascript:/data: — Link only allows the schemes below.
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
