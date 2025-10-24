"use client";

import * as React from "react";

import { normalizeNodeId } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor-kit";
import { SettingsDialog } from "@/components/settings-dialog";
import { Editor, EditorContainer } from "@/components/ui/editor";

type PlateEditorProps = {
  onEditor?: (editor: any) => void;
  onChange?: (value: any) => void;
};

export function PlateEditor({ onEditor, onChange }: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value,
  });

  React.useEffect(() => {
    if (onEditor) onEditor(editor);
  }, [editor, onEditor]);

  return (
    <Plate editor={editor} onChange={onChange}>
      <EditorContainer>
        <Editor variant="demo" />
      </EditorContainer>

      <SettingsDialog />
    </Plate>
  );
}

const value = normalizeNodeId([
  {
    children: [{ text: "Título" }],
    type: "h1",
  },
  {
    children: [{ text: "" }],
    type: "p",
  },
]);
