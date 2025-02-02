"use client";

import Header from "@/components/custom/Header";
import EditorPanel from "@/components/custom/EditorPanel";
import OutputPanel from "@/components/custom/OutputPanel";
import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState<string>("// Hello, world!\nconsole.log('Hello, world!');");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-row p-4 mb-7 space-x-4">
        <div className="flex-1">
        <EditorPanel code={code} setCode={setCode} />

        </div>
        <div className="flex-1">
        <OutputPanel code={code} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground text-center p-4">
        Powered by Monaco Editor
      </footer>
    </div>
  );
}
