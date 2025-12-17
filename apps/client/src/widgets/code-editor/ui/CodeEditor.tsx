import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: "// Write your code here\n\nfunction hello() {\n  console.log('Hello, CodeJam!');\n}\n",
      extensions: [basicSetup, javascript(), githubLight],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} className="h-full" />;
}
