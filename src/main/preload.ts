// Preload script runs in context that has access to both
// Node.js APIs and the DOM

// Expose selected Node.js APIs to the renderer process
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency] || "not available");
  }
});
