import { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { marked } from 'marked';
import { blogApi } from '../../lib/blogApi.js';
import { compressImage } from '../../lib/imageCompress.js';
import { normalizePastedHtml, looksLikeMarkdownTable } from '../../lib/pasteTables.js';

function Btn({ on, active, children, title }) {
  return (
    <button
      type="button"
      className={`tb-btn${active ? ' is-active' : ''}`}
      onClick={on}
      title={title}
    >
      {children}
    </button>
  );
}

export default function Editor({ value, onChange }) {
  const [mode, setMode] = useState('rich'); // 'rich' | 'source'
  const [raw, setRaw] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  // handlePaste is defined before `editor` exists, so it reaches it via a ref.
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { loading: 'lazy', decoding: 'async' } }),
      Placeholder.configure({
        placeholder: 'Write your post… or use Import to paste Markdown/HTML.',
      }),
      // Column resizing is off on purpose: it writes pixel widths that the API
      // sanitiser strips, so the editor would disagree with the published post.
      // Widths are the stylesheet's job, and stay responsive on mobile.
      TableKit.configure({
        table: { resizable: false, allowTableNodeSelection: true },
        tableHeader: { HTMLAttributes: { scope: 'col' } },
      }),
    ],
    content: value || '',
    // TipTap 3 stops re-rendering on transactions by default, which freezes
    // every toolbar active state, and would keep the table controls below
    // from ever appearing when the caret moves into a cell.
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      // Scrub inline widths / Google Docs cruft off pasted tables.
      transformPastedHTML: (html) => normalizePastedHtml(html),

      // A Markdown pipe table copied as plain text has no text/html flavour to
      // parse, so ProseMirror would drop one paragraph per line. Run it through
      // the Markdown parser instead and insert a real table.
      handlePaste: (view, event) => {
        const data = event.clipboardData;
        if (!data) return false;
        if (data.getData('text/html')) return false; // rich paste, handled above
        const text = data.getData('text/plain');
        if (!looksLikeMarkdownTable(text)) return false;
        event.preventDefault();
        editorRef.current
          ?.chain()
          .focus()
          .insertContent(marked.parse(text), { parseOptions: { preserveWhitespace: false } })
          .run();
        return true;
      },
    },
  });
  editorRef.current = editor;

  // Keep editor in sync when parent loads a different post.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
      setRaw(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !editor) return;
      const alt = window.prompt(
        'Alt text (required — describe the image for SEO & screen readers):'
      );
      if (!alt || alt.trim().length < 3) {
        alert('Alt text is required (min 3 characters).');
        return;
      }
      try {
        setUploading(true);
        const c = await compressImage(file);
        const r = await blogApi.upload({
          filename: file.name,
          alt: alt.trim(),
          dataBase64: c.dataUrl,
          type: c.type,
          width: c.width,
          height: c.height,
        });
        editor.chain().focus().setImage({ src: r.url, alt: r.alt }).run();
      } catch (err) {
        alert(`Upload failed: ${err.message}`);
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const doImport = useCallback(() => {
    const text = window.prompt('Paste Markdown or HTML to import:');
    if (text == null || !editor) return;
    const looksHtml = /<\/?[a-z][\s\S]*>/i.test(text);
    const html = looksHtml ? text : marked.parse(text);
    editor.commands.setContent(html, true);
    onChange(editor.getHTML());
  }, [editor, onChange]);

  const applySource = () => {
    onChange(raw);
    if (editor) editor.commands.setContent(raw || '', true);
    setMode('rich');
  };

  if (!editor) return null;
  const is = (n, a) => editor.isActive(n, a);

  return (
    <div className="editor">
      <div className="toolbar">
        <Btn on={() => setMode(mode === 'rich' ? 'source' : 'rich')} title="Toggle raw HTML">
          {mode === 'rich' ? '⟨⟩ HTML' : '✎ Visual'}
        </Btn>
        <span className="tb-sep" />
        {mode === 'rich' && (
          <>
            <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={is('heading', { level: 2 })} title="Heading 2">H2</Btn>
            <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={is('heading', { level: 3 })} title="Heading 3">H3</Btn>
            <Btn on={() => editor.chain().focus().setParagraph().run()} active={is('paragraph')} title="Paragraph">¶</Btn>
            <span className="tb-sep" />
            <Btn on={() => editor.chain().focus().toggleBold().run()} active={is('bold')} title="Bold"><b>B</b></Btn>
            <Btn on={() => editor.chain().focus().toggleItalic().run()} active={is('italic')} title="Italic"><i>I</i></Btn>
            <Btn on={setLink} active={is('link')} title="Link">🔗</Btn>
            <span className="tb-sep" />
            <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={is('bulletList')} title="Bullet list">• List</Btn>
            <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={is('orderedList')} title="Numbered list">1. List</Btn>
            <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={is('blockquote')} title="Quote">❝</Btn>
            <Btn on={() => editor.chain().focus().toggleCodeBlock().run()} active={is('codeBlock')} title="Code block">{'</>'}</Btn>
            <Btn on={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">—</Btn>
            <span className="tb-sep" />
            <Btn
              on={() =>
                editor.chain().focus()
                  .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
                  .run()
              }
              active={is('table')}
              title="Insert table (3×2 with a header row)"
            >
              ▦ Table
            </Btn>
            {is('table') && (
              <>
                <Btn on={() => editor.chain().focus().addRowAfter().run()} title="Add row below">+ Row</Btn>
                <Btn on={() => editor.chain().focus().deleteRow().run()} title="Delete current row">− Row</Btn>
                <Btn on={() => editor.chain().focus().addColumnAfter().run()} title="Add column right">+ Col</Btn>
                <Btn on={() => editor.chain().focus().deleteColumn().run()} title="Delete current column">− Col</Btn>
                <Btn on={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle header row">⊤ Header</Btn>
                <Btn on={() => editor.chain().focus().mergeOrSplit().run()} title="Merge or split cells">⧉ Merge</Btn>
                <Btn on={() => editor.chain().focus().deleteTable().run()} title="Delete the whole table">🗑 Table</Btn>
              </>
            )}
            <span className="tb-sep" />
            <label className="tb-btn" title="Upload image (auto WebP + SEO)">
              {uploading ? '…' : '🖼 Image'}
              <input type="file" accept="image/*" hidden onChange={addImage} />
            </label>
            <Btn on={doImport} title="Import Markdown or HTML">⬇ Import</Btn>
          </>
        )}
      </div>

      {mode === 'rich' ? (
        <EditorContent editor={editor} className="prose-input" />
      ) : (
        <div className="source-edit">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            placeholder="<h2>Raw HTML…</h2>"
          />
          <button type="button" className="btn-sm" onClick={applySource}>
            Apply HTML →
          </button>
        </div>
      )}
    </div>
  );
}
