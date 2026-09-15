# Nilgiris Wildlife Early Warning & Conflict Mitigation Surveillance System

College Research Project: Automated 24/7 Low-Light CCTV & Personal Camera Surveillance for Gudalur Forest Division, Tamil Nadu.

---

## 🚀 How to Run in Visual Studio Code (VS Code)

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Go to **File** > **Open Folder...** and select this extracted project directory.

### Step 2: Open the Integrated Terminal
- Press ``Ctrl + ` `` (backtick) or go to **Terminal** > **New Terminal** in the top menu bar.

### Step 3: Install Dependencies
Ensure you have **Node.js** (v18 or higher) installed on your computer ([Download Node.js](https://nodejs.org/)).
In the terminal, run:

```bash
npm install
```

*(This downloads React, Vite, Tailwind CSS, Lucide icons, and required type definitions into `node_modules`.)*

### Step 4: Start the Application
Run:

```bash
npm run dev
```
*(Or simply `npm start`)*

### Step 5: Open in Your Browser
Once Vite starts, open your browser and navigate to:
```
http://localhost:3000
```
*(If port 3000 is occupied by another app on your computer, Vite will prompt you to run on another port, or you can run `npx vite --port 5173`.)*

---

## 🛠️ Common VS Code Troubleshooting

### 1. Error: `'vite' is not recognized as an internal or external command`
- **Cause:** You ran `npm run dev` before installing packages.
- **Fix:** Run `npm install` first, then run `npm run dev`.

### 2. Error: `Cannot find module 'react'` or red squiggly lines in `.tsx` files
- **Cause:** TypeScript definitions or `node_modules` are not yet installed.
- **Fix:** Run `npm install`. Press `Ctrl + Shift + P` in VS Code, search for **"TypeScript: Restart TS Server"**, and press Enter.

### 3. Error: `Port 3000 is already in use`
- **Fix:** Either close whatever program is using port 3000, or in `package.json` change `"vite --port=3000"` to `"vite"` or `"vite --port=5173"`.

### 4. (Optional) Gemini API Key Configuration
- Create a `.env` file in the project root:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- *Note:* Even without an API key, the system runs with local heuristics and 5 interactive preset demonstration scenarios (Asian Elephant, Leopard, Sloth Bear, Gaur, and Human Workers) for live evaluation and presentation.

---

## 📋 Features Overview
- **Live Camera / Personal Webcam (WebRTC)**: Night-vision IR filters, Starvis boost, contrast/brightness adjustments.
- **AI Animal Intrusion vs. Human Detection**:
  - Wild Animals: Generates critical alert and automated Tamil Nadu Forest Department Rapid Response Team (RRT) dispatch ticket.
  - Humans: Logged as safe, Forest Department alert suppressed to prevent false alarms.
- **Tactical Map**: Gudalur division GPS coordinates, elephant corridors, CCTV coverage cones.
- **Research Archive**: Historical conflict records and low-light casualty analysis with CSV/Markdown download options.
