import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";
import { useYDoc } from "@/shared/lib/hooks/useYDoc";
import { yCollab } from 'y-codemirror.next';

type Language = "javascript" | "html" | "css";

interface CodeEditorProps {
  language?: Language;
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
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { yText, awareness } = useYDoc('prototype');

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
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, awareness, yText]);

  return <div ref={editorRef} className="h-full" />;
}
