# ⏳ Pomodoro Minutor

A simple **Pomodoro timer** built with **Electron** and **Tailwind CSS**.  
Cross-platform (macOS, Windows, Linux) with a clean and minimal UI.

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📦 Features

- ⏰ Pomodoro timer (focus / break cycles)  
- 📝 User profile with avatar & pseudo (stored locally)  
- 🎨 Tailwind CSS styling for a modern look  
- 🖥️ Packaged with [electron-builder](https://www.electron.build/) for distribution  

---

## 🚀 Download

Latest stable version: [👉 Go to Releases](https://github.com/kamalc0des/pomodoro-minutor/releases/latest)

| Platform   | Download |
|------------|----------|
| 🍎 macOS   | ✅ |
| 🪟 Windows | ✅ |

---

## 🚀 Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/kamalc0des/pomodoro-minutor.git
cd pomodoro-minutor
npm install
```

### Development mode
```bash
npm run dev
```

### Build production package
```bash
npm run dist
```

The executables will be available in the **`release/`** folder.

---

## 📂 Project Structure

```
pomodoro-minutor/
├── dist/                # Compiled files
├── public/              # HTML, CSS, icons
├── src/
│   ├── electron/        # Main + preload scripts
│   └── renderer/        # Renderer scripts (TS)
├── release/             # Built executables (.dmg, .exe, .AppImage)
├── package.json
├── LICENSE
└── README.md
```

---

## 🖥️ Supported Platforms

- macOS (DMG installer)  
- Windows (NSIS installer)  
- Linux (AppImage)  

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).  
You are free to **use, copy, modify, and distribute** this project.

---

👤 Author: **Kamal Aarab**
