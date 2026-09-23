# 🗄️ CabinetMap - HR & Admin File Tracker System

Welcome to **CabinetMap**! This is a complete enterprise HR & Admin document tracking system with interactive 3D cabinet wall elevations, drag-and-drop file management, universal search, archive transfer boxes, and trash bin recovery.

---

## 🌟 What is CabinetMap?

CabinetMap helps HR and Admin teams visually organize physical files, folders, and box files inside office storage cabinets.

### 🚀 Key Features:
- 🏢 **Multi-Wall Elevation View**:
  - **Wall 1**: 6 standard 6-shelf cabinets (Cabinets 1 to 6).
  - **Wall 2**: 2 modular 3-door cabinets (`Cabinet 1 (W2)` & `Cabinet 2 (W2)`) separated by a toilet door.
  - **Wall 3 (Right & Left)**: Extra wall views.
- 📦 **Archive Transfer Box**: Drag & drop files into the top archive box to move items easily between Wall 1 and Wall 2.
- 🖐️ **Drag & Drop Organization**: Drag files into magazines, reorder items on shelves, or move items across cabinets.
- 🔍 **Instant Search (`Ctrl + K`)**: Find any employee name, ID number, department, or file code instantly.
- 🗑️ **Trash Bin & Recovery**: Soft-delete items to the trash modal, filter deleted items, restore them back to their original shelf, or permanently delete them.

---

## 👶 Windows Beginner Installation Guide (Step-by-Step for Kids & Beginners)

Even if you have **never installed software development tools before**, follow these easy steps to get CabinetMap running on your Windows computer!

---

### 📥 Step 1: Install Git (The Project Downloader)

1. Open your web browser (Google Chrome or Microsoft Edge).
2. Go to this website: **[https://git-scm.com/download/win](https://git-scm.com/download/win)**
3. Click **"64-bit Git for Windows Setup"** to download the installer.
4. Open the downloaded file (`Git-2.xx.x-64-bit.exe`).
5. Keep clicking **"Next"** on every screen without changing anything, then click **"Install"**.
6. When finished, click **"Finish"**.

---

### 🟢 Step 2: Install Node.js (Runs the Frontend Web Page)

1. Go to this website: **[https://nodejs.org/](https://nodejs.org/)**
2. Click the big green button that says **"LTS (Recommended For Most Users)"**.
3. Open the downloaded `.msi` file.
4. Click **"Next"**, check the box for *"I accept the terms in the License Agreement"*, then click **"Next"** -> **"Next"** -> **"Install"**.
5. If Windows asks for permission, click **"Yes"**.
6. Click **"Finish"**.

---

### 🟣 Step 3: Install .NET SDK (Runs the Backend Database & Server)

1. Go to this website: **[https://dotnet.microsoft.com/download/dotnet/10.0](https://dotnet.microsoft.com/download/dotnet/10.0)** (or version 9.0/8.0).
2. Look for **"SDK 10.0.xxx"** under the **Windows** column and click **x64**.
3. Open the downloaded installer file.
4. Click **"Install"**, then click **"Yes"** if Windows asks for permission.
5. Once completed, click **"Close"**.

---

### 💙 Step 4: Install Visual Studio Code (Code Editor)

1. Go to this website: **[https://code.visualstudio.com/](https://code.visualstudio.com/)**
2. Click the big blue button **"Download for Windows"**.
3. Open the downloaded installer file (`VSCodeUserSetup-x64-x.xx.x.exe`).
4. Select *"I accept the agreement"*, click **"Next"**.
5. Check the box **"Add to PATH"** and click **"Next"** -> **"Install"**.
6. Click **"Finish"**.

---

### 📂 Step 5: Download the CabinetMap Code

1. Click the Windows **Start Menu** at the bottom of your screen.
2. Type **`cmd`** and press **Enter** to open the **Command Prompt** (the black window).
3. Type the following command and press **Enter**:
   ```cmd
   git clone https://github.com/shrabondas5544/HR-Admin-File-tracker-frontend.git HR-Admin-File-tracker
   ```
4. Now enter the project folder by typing:
   ```cmd
   cd HR-Admin-File-tracker
   ```

---

### ⚙️ Step 6: Install Frontend Packages

1. Inside your Command Prompt, move into the `frontend` folder:
   ```cmd
   cd frontend
   ```
2. Type this command to download all required frontend libraries:
   ```cmd
   npm install
   ```
3. Wait 1 to 2 minutes until it finishes downloading.

---

### 🖥️ Step 7: Start the Backend Server (Database & API)

1. Open a **SECOND** Command Prompt window:
   - Press **Windows Key + R**, type `cmd`, and press **Enter**.
2. In this new black window, navigate to your project's `backend` directory:
   ```cmd
   cd HR-Admin-File-tracker\backend
   ```
3. Start the backend server by typing:
   ```cmd
   dotnet run
   ```
4. You will see text ending with:
   `Now listening on: http://localhost:5000`
   *(Keep this window open! It is your database server).*

---

### 🌐 Step 8: Start the Frontend App

1. Go back to your **FIRST** Command Prompt window (the one inside the `frontend` folder).
2. Type this command to start the web app:
   ```cmd
   npm run dev
   ```
3. You will see:
   `- Local: http://localhost:3000`

---

### 🎉 Step 9: Open CabinetMap in Your Browser!

1. Open **Google Chrome** or **Microsoft Edge**.
2. Type `http://localhost:3000` in the address bar at the top and press **Enter**.
3. **Woohoo! 🥳 CabinetMap is now running live on your computer!**

---

## 🛠️ Quick Command Summary for Windows

| Action | Open Terminal 1 (`frontend`) | Open Terminal 2 (`backend`) |
| :--- | :--- | :--- |
| **Go to Folder** | `cd HR-Admin-File-tracker\frontend` | `cd HR-Admin-File-tracker\backend` |
| **Start Server** | `npm run dev` | `dotnet run` |
| **Web Address** | `http://localhost:3000` | `http://localhost:5000` |

---

## 🏗️ Project Architecture

```
HR-Admin-File-tracker/
├── frontend/                     # Next.js 16 + React + Tailwind CSS Web App
│   ├── src/
│   │   ├── app/                  # Next.js App Router (page.tsx)
│   │   ├── components/           # Cabinet, Shelf, Drag & Drop, Search & Modal components
│   │   └── lib/                  # TypeScript interfaces and API handlers
│   └── package.json
└── backend/                      # ASP.NET Core 10 Web API + Entity Framework Core
    ├── Controllers/              # REST API Endpoints (Cabinets, Files, Search, Trash)
    ├── Data/                     # DbContext and DbInitializer (Auto Seed Data)
    ├── Models/                   # C# Data Models (Cabinet, Shelf, Magazine, Folder, File)
    └── CabinetMap.Api.csproj
```

---

## 🤝 Troubleshooting & Help

- **Question**: *Why is my page blank or showing network error?*
  - **Fix**: Make sure both `dotnet run` (in backend) and `npm run dev` (in frontend) are running at the same time in separate command prompt windows!
- **Question**: *How do I stop the servers when I am done?*
  - **Fix**: Click on the black Command Prompt window and press `Ctrl + C` on your keyboard.

---

Made with ❤️ for HR & Admin File Tracker. Happy archiving! 📁✨
