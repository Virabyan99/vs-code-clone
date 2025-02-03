import ReactDOM from "react-dom/client";
import * as monaco from "monaco-editor";
import FindReplaceDialog from "@/components/custom/FindReplaceDialog"; // Ensure this is imported correctly

export const samplePlugin = {
  rootInstance: null as ReactDOM.Root | null, // ✅ Corrected type
  container: null as HTMLElement | null, // ✅ Ensure it's also correctly typed

  activate(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      // ✅ Create a container for the FindReplaceDialog
      const container = document.createElement("div");
      container.id = "find-replace-dialog-container";
      document.body.appendChild(container);

      // ✅ Render FindReplaceDialog inside the container
      const root = ReactDOM.createRoot(container);
      root.render(<FindReplaceDialog editor={editor} />);

      // ✅ Store the root for cleanup when deactivating
      samplePlugin.rootInstance = root;
      samplePlugin.container = container;
    });
  },

  deactivate(editor: monaco.editor.IStandaloneCodeEditor) {
    console.log("Plugin deactivated.");

    // ✅ Clean up: Unmount FindReplaceDialog and remove container
    if (samplePlugin.rootInstance && samplePlugin.container) {
      samplePlugin.rootInstance.unmount(); // ✅ Proper unmounting
      samplePlugin.container.remove();
    }

    // ✅ Reset references
    samplePlugin.rootInstance = null;
    samplePlugin.container = null;
  },
};

export class PluginManager {
  private editor: monaco.editor.IStandaloneCodeEditor;
  private plugins: Record<string, any> = {};

  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }

  /** Load a new plugin */
  loadPlugin(name: string, plugin: any) {
    if (this.plugins[name]) {
      console.warn(`Plugin ${name} is already loaded.`);
      return;
    }
    this.plugins[name] = plugin;
    plugin.activate(this.editor);
  }

  /** Unload an existing plugin */
  unloadPlugin(name: string) {
    if (!this.plugins[name]) {
      console.warn(`Plugin ${name} is not loaded.`);
      return;
    }
    this.plugins[name].deactivate(this.editor);
    delete this.plugins[name];
  }

  /** Get all loaded plugins */
  getLoadedPlugins() {
    return Object.keys(this.plugins);
  }
}

  
  export const themePlugin = {
    activate(editor: monaco.editor.IStandaloneCodeEditor) {
      monaco.editor.defineTheme("customTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [{ token: "keyword", foreground: "ff0000", fontStyle: "bold" }],
        colors: { "editor.background": "#000000" },
      });
      editor.updateOptions({ theme: "customTheme" });
    },
    deactivate(editor: monaco.editor.IStandaloneCodeEditor) {
      editor.updateOptions({ theme: "vs-dark" });
    },
  };
  