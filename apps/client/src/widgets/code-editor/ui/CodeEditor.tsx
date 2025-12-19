import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";
import { useYDoc } from "@/shared/lib/hooks/useYDoc";
import { yCollab } from "y-codemirror.next";

type Language = "javascript" | "html" | "css";

interface CodeEditorProps {
  language?: Language;
  readOnly?: boolean;
}

const getLanguageExtension = (language: Language) => {
  switch (language) {
    case "javascript":
      return javascript({ jsx: true, typescript: true });
    case "html":
      return html();
    case "css":
      return css();
    default:
      return javascript({ jsx: true, typescript: true });
  }
};

export default function CodeEditor({
  language = "javascript",
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { yText, awareness } = useYDoc("prototype");

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        javascript(),
        yCollab(yText, awareness),
        getLanguageExtension(language),
        githubLight,
        EditorState.readOnly.of(readOnly),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
          ...(readOnly && {
            ".cm-cursor, .cm-dropCursor": { display: "none !important" },
            // ".cm-selectionBackground": { display: "none !important" },
            // ".cm-ySelectionCaret, .cm-ySelectionCaretDot": { display: "none !important" },
          }),
        }),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, awareness, yText, readOnly]);

  return <div ref={editorRef} className="h-full" />;
}
