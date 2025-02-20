const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  globalShortcut,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { processMarkdownFiles } = require("./src/converter");

// Global configuration object to store user selections and extra options
let globalConfig = {
  inputDirectory: null,
  headerPath: null,
  footerPath: null,
  contentPath: null,
  stylePath: null,
  outputDirectory: null,
  // New options for index customization:
  summaryWordCount: 30, // default
  defaultAuthor: "",
  includeDateModified: false,
};

function createWindow(htmlFile) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hiddenInset", // Native macOS style
    icon: path.join(__dirname, "assets", "icons", "icon.png"), // For Windows/Linux
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false, // Disables DevTools
    },
  });
  win.loadFile(path.join(__dirname, "renderer", htmlFile));

  // Prevent DevTools from being opened manually
  win.webContents.on("devtools-opened", () => {
    win.webContents.closeDevTools();
  });

  return win;
}

app.whenReady().then(() => {
  let win = createWindow("index.html");

  // Disable DevTools shortcut
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    return false;
  });

  // Expose globalConfig to renderer processes
  ipcMain.handle("get-global-config", () => globalConfig);

  // When a directory is selected, auto-check for header/footer/style files.
  ipcMain.on("select-directory", async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      globalConfig.inputDirectory = result.filePaths[0];
      const files = fs.readdirSync(globalConfig.inputDirectory);

      if (files.includes("header.md")) {
        globalConfig.headerPath = path.join(
          globalConfig.inputDirectory,
          "header.md",
        );
      }
      if (files.includes("footer.md")) {
        globalConfig.footerPath = path.join(
          globalConfig.inputDirectory,
          "footer.md",
        );
      }
      if (files.includes("style.css")) {
        globalConfig.stylePath = path.join(
          globalConfig.inputDirectory,
          "style.css",
        );
      } else if (files.includes("styles.css")) {
        globalConfig.stylePath = path.join(
          globalConfig.inputDirectory,
          "styles.css",
        );
      }
      const markdownFiles = files.filter(
        (file) =>
          file.endsWith(".md") && !["header.md", "footer.md"].includes(file),
      );
      if (markdownFiles.length > 0) {
        globalConfig.contentPath = globalConfig.inputDirectory;
      }

      event.reply("directory-selected", globalConfig.inputDirectory);
    }
  });

  // Generic file selection for markdown or CSS files.
  ipcMain.on("select-file", async (event, fileType) => {
    let filters = [];
    if (fileType === "markdown") {
      filters = [{ name: "Markdown", extensions: ["md"] }];
    } else if (fileType === "css") {
      filters = [{ name: "CSS", extensions: ["css"] }];
    }
    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      if (fileType === "markdown") {
        if (!globalConfig.headerPath) {
          globalConfig.headerPath = result.filePaths[0];
        } else if (!globalConfig.footerPath) {
          globalConfig.footerPath = result.filePaths[0];
        } else if (!globalConfig.contentPath) {
          globalConfig.contentPath = result.filePaths[0];
        }
      } else if (fileType === "css") {
        globalConfig.stylePath = result.filePaths[0];
      }
      event.reply("file-selected", { fileType, path: result.filePaths[0] });
    }
  });

  ipcMain.on("select-output-directory", async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      globalConfig.outputDirectory = result.filePaths[0];
      event.reply("output-directory-selected", globalConfig.outputDirectory);
    }
  });

  // Trigger conversion using the current configuration and extra options
  ipcMain.on("generate-html", (event, extraOptions) => {
    // Update globalConfig with extra options from the output page
    globalConfig.summaryWordCount =
      parseInt(extraOptions.summaryWordCount) || 30;
    globalConfig.defaultAuthor = extraOptions.defaultAuthor || "";
    globalConfig.includeDateModified =
      extraOptions.includeDateModified || false;

    if (!globalConfig.outputDirectory) {
      return event.reply("error", "Output directory not selected");
    }
    if (!globalConfig.contentPath) {
      return event.reply("error", "Content markdown not provided");
    }
    try {
      processMarkdownFiles(globalConfig);
      event.reply("generation-success", "HTML files generated successfully");
    } catch (err) {
      console.error(err);
      event.reply("error", "Error generating HTML files: " + err.message);
    }
  });
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow("index.html");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
