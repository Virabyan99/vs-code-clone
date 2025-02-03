"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";

import { Button } from "@/components/ui/button"; // ShadCN Button
import { PluginManager, samplePlugin, themePlugin } from "@/app/plugins/pluginManager";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import FindReplaceDialog from "./FindReplaceDialog"; // ✅ Import FindReplaceDialog

interface EditorPanelProps {
  tabs: { name: string; content: string }[];
  setTabs: Dispatch<SetStateAction<{ name: string; content: string }[]>>;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

// Dynamic Import for Monaco Editor
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const EditorPanel: React.FC<EditorPanelProps> = ({ tabs, setTabs, activeTab, setActiveTab }) => {
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [pluginManager, setPluginManager] = useState<PluginManager | null>(null);
  const editorRef = useRef<any>(null);
  const secondEditorRef = useRef<any>(null); // ✅ Reference for second editor

  // State to control Find & Replace
  const [showFindReplace, setShowFindReplace] = useState(false);

  // Initialize Monaco Editor
  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    const manager = new PluginManager(editor);
    setPluginManager(manager);
  };

  const handleSecondEditorMount = (editor: any) => {
    secondEditorRef.current = editor;
  };

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

  useEffect(() => {
    localStorage.setItem("editor-tabs", JSON.stringify(tabs));
  }, [tabs]);

  // Add new tab
  const addTab = () => {
    const newFile = { name: `file${tabs.length + 1}.js`, content: "// New File\n" };
    setTabs([...tabs, newFile]);
    setActiveTab(newFile.name);
  };

  // Close a tab
  const closeTab = (fileName: string) => {
    const newTabs = tabs.filter((tab) => tab.name !== fileName);
    setTabs(newTabs);
    if (fileName === activeTab) {
      setActiveTab(newTabs.length > 0 ? newTabs[0].name : ""); // Set new active tab
    }
  };

  return (
    <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
      {/* Tabs & Plugin Dropdown */}
      <div className="flex items-center justify-between mb-4 bg-[#1e1e2e] rounded-lg p-2">
        <div className="flex gap-2">
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
          <Button onClick={addTab} className="ml-3">+ Add Tab</Button>
        </div>

        {/* Plugin Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Plugins</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => pluginManager?.loadPlugin("samplePlugin", samplePlugin)}>
              Enable Command Plugin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => pluginManager?.unloadPlugin("samplePlugin")}>
              Disable Command Plugin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => pluginManager?.loadPlugin("themePlugin", themePlugin)}>
              Enable Theme Plugin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => pluginManager?.unloadPlugin("themePlugin")}>
              Disable Theme Plugin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowFindReplace(true)}>Open Find & Replace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ✅ Toggle Split Mode */}
        <Button onClick={() => setIsSplit(!isSplit)}>Toggle Split</Button>
      </div>

      {/* ✅ Editor Panel */}
      <div className={`flex ${isSplit ? "gap-4" : ""}`}>
        <MonacoEditor
          height="600px"
          language="javascript"
          theme="vs-dark"
          value={tabs.find((tab) => tab.name === activeTab)?.content || ""}
          onChange={(value) => {
            setTabs(
              tabs.map((tab) =>
                tab.name === activeTab ? { ...tab, content: value || "" } : tab
              )
            );
          }}
          onMount={handleEditorMount}
          width={isSplit ? "50%" : "100%"} // ✅ Adjust width on split
        />

        {isSplit && (
          <MonacoEditor
            height="600px"
            language="javascript"
            theme="vs-dark"
            value={tabs.find((tab) => tab.name === activeTab)?.content || ""}
            onMount={handleSecondEditorMount}
            width="50%" // ✅ Split Width
          />
        )}
      </div>

      {/* ✅ Find & Replace Dialog */}
      {/* {showFindReplace && <FindReplaceDialog editor={editorRef.current} />} */}
    </div>
  );
};

export default EditorPanel;
