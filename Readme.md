# StatiqForge

**StatiqForge** is a simple and intuitive **Markdown to HTML** converter built with **Electron** and **Node.js**. It provides a smooth, full-window experience, allowing users to select a directory or individual files and generate HTML pages with headers, footers, and styles.

The app is designed with a **macOS-inspired aesthetic**.

---

## 🚀 Features
- Convert **Markdown files** into **styled HTML**.
- Automatically **skip steps** if files are preloaded.
- **Header (`header.md`)** and **Footer (`footer.md`)** injection.
- Custom **CSS (`style.css`)** support.
- Generates an **`index.html`** page with links and previews.
- **Cross-platform**: Works on **macOS, Windows, and Linux**.

---

## 🛠️ Installation

### 🔹 Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org) (Latest LTS recommended)
- [Git](https://git-scm.com/)
- [Electron](https://www.electronjs.org/)

### 🔹 Clone the Repository
```sh
git clone https://github.com/Daemon996/StatiqForge.git
cd StatiqForge
```

### 🔹 Install Dependencies
```sh
npm install
```

### 🔹 Run the App
```sh
npm start
```

---

## 📦 Packaging StatiqForge

You can package StatiqForge as a standalone app for **macOS, Windows, or Linux** using `electron-builder`:

```sh
npm run dist
```

By default, this will create platform-specific binaries in the `dist/` folder.

---

## 📝 Usage

1. **Select a directory** *(optional, auto-skips steps if preloaded)*
2. **Choose a `header.md` file** (if not already present)
3. **Choose a `footer.md` file** (if not already present)
4. **Select Markdown files to convert**
5. **Choose a custom `style.css`** (optional)
6. **Select an output directory**
7. 🎉 **Statiq generates HTML pages with styling!**

Each Markdown file is converted into an `.html` file with the **header and footer** added. A **`index.html`** page is also generated with links and excerpts.

---

## 🔧 Configuration
- **Icons:** Place platform-specific icons in `assets/icons/`:
  - macOS: `icon.icns`
  - Windows: `icon.ico`
  - Linux: `icon.png`
- **Customization:** Modify `renderer/css/app.css` to adjust the UI.

---

## 💡 Tech Stack
- **Electron.js** – Cross-platform desktop application
- **Node.js** – File system operations
- **Marked.js** – Markdown to HTML conversion
- **CSS (Custom)**

---

## 📜 License
**MIT License** – You are free to modify and distribute StatiqForge, with attribution.

---

## 📬 Contact
👤 **Nathan Courtney**
🌐 [dev.nathancourtney.com](https://dev.nathancourtney.com)

---

Enjoy using **StatiqForge**! 🚀✨
