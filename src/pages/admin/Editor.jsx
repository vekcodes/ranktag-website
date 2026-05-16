import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { marked } from 'marked';
import { blogApi } from '../../lib/blogApi.js';
import { compressImage } from '../../lib/imageCompress.js';

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { loading: 'lazy', decoding: 'async' } }),
      Placeholder.configure({
        placeholder: 'Write your post… or use Import to paste Markdown/HTML.',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

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
