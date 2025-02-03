"use client";

import Header from "@/components/custom/Header";
import EditorPanel from "@/components/custom/EditorPanel";
import OutputPanel from "@/components/custom/OutputPanel";
import { useState } from "react";

export default function Home() {
  const [tabs, setTabs] = useState<{ name: string; content: string }[]>([
    { name: "file1.js", content: "// Hello, world!\nconsole.log('Hello, world!');" },
  ]);
  const [activeTab, setActiveTab] = useState<string>("file1.js");

  // Get the content of the active file
  const activeFileContent = tabs.find((tab) => tab.name === activeTab)?.content || "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex flex-row p-4 mb-7 space-x-4">
        <div className="flex-1">
          <EditorPanel tabs={tabs} setTabs={setTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex-1">
          <OutputPanel code={activeFileContent} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground text-center p-4">
        Powered by Monaco Editor
      </footer>
    </div>
  );
}
