"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as monaco from "monaco-editor";

interface FindReplaceDialogProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
}

export default function FindReplaceDialog({ editor }: FindReplaceDialogProps) {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [open, setOpen] = useState(true); // ✅ Open immediately

  const handleFindReplace = () => {
    if (!editor || !searchText) return;

    const model = editor.getModel();
    if (!model) return;

    const fullText = model.getValue();
    const updatedText = fullText.replace(new RegExp(searchText, "g"), replaceText);

    editor.executeEdits("", [
      {
        range: model.getFullModelRange(),
        text: updatedText,
      },
    ]);

    editor.focus();
    setOpen(false); // Close the dialog after replacing
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-black">Find & Replace</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Find..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Input
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleFindReplace}>Replace All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
