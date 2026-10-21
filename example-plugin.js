(function () {
  function registerPlugin(plugin) {
    if (window.registerStudioPlugin) {
      window.registerStudioPlugin(plugin);
      return;
    }
    console.warn("registerStudioPlugin not ready yet.");
  }

  registerPlugin({
    name: "Insert Example",
    command: "insert-example",
    run: function () {
      const editor = document.getElementById("editor");
      if (!editor) return;
      editor.value += "\n<div class=\"example-card\">Example plugin output</div>\n";
      const activeTab = document.querySelector(".tab.active");
      if (activeTab) {
        const content = editor.value;
        const tab = { content };
        if (window.__htmlStudioActiveTab) {
          window.__htmlStudioActiveTab.content = content;
        }
      }
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      if (window.log) window.log("Example plugin executed successfully.");
    }
  });
})();
