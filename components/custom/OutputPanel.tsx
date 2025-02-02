import { useState } from "react";
import { Copy, Terminal, CheckCircle } from "lucide-react";
import RunButton from "./RunButton";

function OutputPanel({ activeFileContent }: { activeFileContent: string | null }) {
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleRun = async () => {
    if (!activeFileContent) return;
    setIsRunning(true);
    setError(null);
    setOutput(null);

    try {
      let capturedOutput = "";
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        capturedOutput += args.map((arg) => String(arg)).join(" ") + "\n";
        originalConsoleLog(...args);
      };

      const result = eval(activeFileContent);
      console.log = originalConsoleLog;

      setOutput(capturedOutput || (result !== undefined ? result.toString() : ""));
    } catch (err: any) {
      setError(err.message);
    }

    setIsRunning(false);
  };

  const handleCopy = async () => {
    if (!output && !error) return;
    const textToCopy = error ? `Error: ${error}` : output;

    try {
      await navigator.clipboard.writeText(textToCopy || "");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative bg-[#181825] rounded-xl p-6 ring-1 ring-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
            <Terminal className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300">Output</span>
        </div>

        <div className="flex gap-x-3 items-center">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!output && !error}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 
              hover:text-gray-300 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800/50 
              hover:ring-gray-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>

          {/* Run Button */}
          <RunButton isRunning={isRunning} onClick={handleRun} />
        </div>
      </div>

      {/* Output Area */}
      <div className="relative">
        <div className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm">
          {isRunning ? (
            <div className="text-gray-500">Running...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : output ? (
            <div className="text-green-500 whitespace-pre-wrap">{output}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="text-center">Run your code to see the output here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OutputPanel;
