# 📄 Signature Injection Engine

A production-grade web application that allows users to **securely place, preview, and embed handwritten signatures into PDF documents** using precise coordinate mapping and backend PDF injection.

This project solves a **real-world digital signing problem** by accurately translating browser-based interactions into **PDF coordinate space**, ensuring signatures appear **exactly where the user placed them** — regardless of screen size or device.

---

## 🚀 Features

* 📄 **PDF Rendering Engine** (client-side, high performance)
* ✍️ **Draw Signature** using canvas
* 📦 **Drag & Resize Signature Box** (percentage-based positioning)
* 🔄 **Responsive PDF Layout** (works across devices)
* 📐 **Accurate Browser → PDF Coordinate Conversion**
* 🔐 **Backend PDF Signing** (no client-side mutation)
* 🗄️ **MongoDB Storage** for signed document metadata
* 📥 **Download Signed PDF**
* 🧪 Built with **race-condition safe canvas rendering**

---

## 🧠 Core Technical Challenges Solved

### 1️⃣ Browser vs PDF Coordinate System

| System           | Origin      |
| ---------------- | ----------- |
| Browser / Canvas | Top-Left    |
| PDF              | Bottom-Left |

This mismatch is a **common failure point in PDF signing systems**.

✔️ **Solution**
We store signature position in **percentages** on the frontend and convert them into **absolute PDF points** on the backend using coordinate transformation logic.

---

✔️ Benefits:

* Responsive across screen sizes
* PDF resolution independent
* Safe for zoom & resize
* Backend-friendly conversion


---

## 🏗️ Architecture Overview

```
Frontend (React)
 ├─ PDF Render (pdf.js)
 ├─ Signature Pad (Canvas)
 ├─ Drag/Resize (react-rnd)
 └─ Percentage-based coords
        ↓
Backend (Node.js / Express)
 ├─ Convert coords → PDF space
 ├─ Inject signature (pdf-lib)
 ├─ Save signed PDF
 └─ Store metadata (MongoDB)
```

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* pdfjs-dist
* react-rnd
* HTML Canvas

### Backend

* Node.js
* Express
* pdf-lib
* MongoDB
* File system

---

## ▶️ Run Locally

### 1️⃣ Clone Repo

```bash
git clone https://github.com/<your-username>/signature-injection-engine
```

---

### 2️⃣ Frontend Setup

```bash
cd signature-engine-frontend
npm install
npm run dev
```

Runs on: `http://localhost:5173`

---

### 3️⃣ Backend Setup

```bash
cd signature-engine-backend
npm install
npm run dev
```

Runs on: `http://localhost:4000`


---

## 🔐 Security Notes

* PDF signing is performed **server-side**
* Signature image never mutates original PDF on client
* Safe for production extension

---

## 🧩 Future Enhancements

* Multi-page PDF support
* Multiple signatures
* Signature verification & hashing
* Role-based access
* Cloud storage (S3)
* Audit trail dashboard

---

## 👨‍💻 Author

**Santosh Rai**
Full-Stack Developer
React • Node.js • PDF Systems • Backend Architecture

---

## ⭐ Why This Project Matters

This project demonstrates:

* Real-world **coordinate system handling**
* PDF internals understanding
* Production-grade frontend-backend sync
* Strong system thinking (not just UI)


"# Signature-Injection-Engine" 
