import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";

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

const getDefaultCode = (language: Language) => {
  switch (language) {
    case "javascript":
      return "// Write your JavaScript code here\n\nfunction hello() {\n  console.log('Hello, CodeJam!');\n}\n";
    case "html":
      return "<!-- Write your HTML code here -->\n\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>CodeJam</title>\n  </head>\n  <body>\n    <h1>Hello, CodeJam!</h1>\n  </body>\n</html>\n";
    case "css":
      return "/* Write your CSS code here */\n\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n";
    default:
      return "";
  }
};

export default function CodeEditor({
  language = "javascript",
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: getDefaultCode(language),
      extensions: [
        basicSetup,
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
  }, [language]);

  return <div ref={editorRef} className="h-full" />;
}
