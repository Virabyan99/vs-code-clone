"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "../../public/logo.svg";

// Dynamic Import for Monaco Editor (Reduces Initial Load Time)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const EditorPanel = () => {
  const [tabs, setTabs] = useState<{ name: string; content: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Load tabs from localStorage
  useEffect(() => {
    const savedTabs = JSON.parse(localStorage.getItem("editor-tabs") || "[]");
    if (savedTabs.length > 0) {
      setTabs(savedTabs);
      setActiveTab(savedTabs[0].name);
    } else {
      addTab(); // Create first file if none exist
    }
  }, []);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("editor-tabs", JSON.stringify(tabs));
  }, [tabs]);

  const addTab = () => {
    const newFile = { name: `file${tabs.length + 1}.js`, content: "// New File\n" };
    setTabs([...tabs, newFile]);
    setActiveTab(newFile.name);
  };

  const closeTab = (fileName: string) => {
    const newTabs = tabs.filter((tab) => tab.name !== fileName);
    setTabs(newTabs);
    if (fileName === activeTab) {
      setActiveTab(newTabs.length > 0 ? newTabs[0].name : null);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setTabs(
      tabs.map((tab) =>
        tab.name === activeTab ? { ...tab, content: value || "" } : tab
      )
    );
  };

  return (
    <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4 bg-[#1e1e2e] rounded-lg p-2">
        {tabs.map((tab) => (
          <div key={tab.name} className="flex items-center">
            <button
              className={`px-3 py-2 rounded-md ${
                activeTab === tab.name ? "bg-blue-600 text-white" : "text-gray-400"
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.name}
            </button>
            <button
              onClick={() => closeTab(tab.name)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
        <button onClick={addTab} className="ml-3 bg-green-600 text-white px-3 py-2 rounded-md">
          + Add Tab
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
        {activeTab && (
          <MonacoEditor
            height="600px"
            language="javascript"
            theme="vs-dark"
            value={tabs.find((tab) => tab.name === activeTab)?.content || ""}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              folding: true,
              matchBrackets: "always",
              formatOnPaste: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPanel;
