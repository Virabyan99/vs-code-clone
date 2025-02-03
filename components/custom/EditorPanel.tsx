"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";

import { Button } from "@/components/ui/button";
import FindReplaceDialog from "./FindReplaceDialog";

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

const DEFAULT_TOKENS = 20000; // ✅ Default token count

const EditorPanel: React.FC<EditorPanelProps> = ({ tabs, setTabs, activeTab, setActiveTab }) => {
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [remainingTokens, setRemainingTokens] = useState<number>(DEFAULT_TOKENS);
  const [tokensUsedPerTab, setTokensUsedPerTab] = useState<Record<string, number>>({});
  const editorRef = useRef<any>(null);
  const secondEditorRef = useRef<any>(null);

  // Load saved tokens from localStorage
  useEffect(() => {
    const savedTokens = localStorage.getItem("remainingTokens");
    const savedTokensUsedPerTab = localStorage.getItem("tokensUsedPerTab");

    if (savedTokens) setRemainingTokens(Number(savedTokens));
    if (savedTokensUsedPerTab) setTokensUsedPerTab(JSON.parse(savedTokensUsedPerTab));
  }, []);

  // Function to calculate tokens based on code length
  const calculateTokens = (code: string) => {
    return Math.ceil(code.length / 4); // ✅ Approximate token cost (4 chars = 1 token)
  };

  // Handle text changes in the editor for ANY tab
  const handleEditorChange = (value: string | undefined) => {
    if (!value || !activeTab || remainingTokens <= 0) return; // ✅ Prevent editing when tokens are 0

    const currentTokensUsed = calculateTokens(value);
    const previousTokensUsed = tokensUsedPerTab[activeTab] || 0; // Get previously used tokens for this tab
    const tokenDifference = currentTokensUsed - previousTokensUsed;

    if (tokenDifference > 0) {
      // ✅ Only subtract if tokens are increasing (typing more text)
      setRemainingTokens((prev) => Math.max(prev - tokenDifference, 0));
    }

    // Update tokens used per tab
    setTokensUsedPerTab((prev) => ({
      ...prev,
      [activeTab]: currentTokensUsed, // Store updated token count for the active tab
    }));

    // Save to localStorage
    localStorage.setItem("remainingTokens", remainingTokens.toString());
    localStorage.setItem("tokensUsedPerTab", JSON.stringify(tokensUsedPerTab));

    // Update tab content
    setTabs(
      tabs.map((tab) =>
        tab.name === activeTab ? { ...tab, content: value || "" } : tab
      )
    );
  };

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
      setActiveTab(newTabs.length > 0 ? newTabs[0].name : "");
    }
  };

  return (
    <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
      {/* Tabs & Controls */}
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

        {/* ✅ Token Display */}
        <span className="text-white text-sm">Tokens Left: {remainingTokens}</span>

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
          onChange={handleEditorChange}
          onMount={(editor) => (editorRef.current = editor)}
          width={isSplit ? "50%" : "100%"} // ✅ Adjust width on split
          options={{
            readOnly: remainingTokens <= 0, // ✅ Disable writing when tokens are 0
          }}
        />

        {isSplit && (
          <MonacoEditor
            height="600px"
            language="javascript"
            theme="vs-dark"
            value={tabs.find((tab) => tab.name === activeTab)?.content || ""}
            onMount={(editor) => (secondEditorRef.current = editor)}
            width="50%" // ✅ Split Width
            options={{
              readOnly: remainingTokens <= 0, // ✅ Disable writing when tokens are 0
            }}
          />
        )}
      </div>

    
    </div>
  );
};

export default EditorPanel;
