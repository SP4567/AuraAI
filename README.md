# AuraAI 🌌

> **The All-in-One Fullstack Generative AI Suite** — Seamlessly uniting multimodal language models, visual AI synthesis, neural image processing, community sharing, and SaaS subscription orchestration in one enterprise-ready codebase.

---

## 🚀 Overview

**AuraAI** provides a cohesive, end-to-end creative workspace offering nine specialized AI capabilities:

1. **✍️ AI Article Writer** — Generates structured, comprehensive articles with customizable lengths, live word-count analytics, one-click clipboard copying, and `.md` export.
2. **🏷️ Blog Title Generator** — High-CTR, catchy title ideation across 8 distinct content verticals with rationale breakdowns.
3. **🎨 AI Image Generation** — Text-to-image synthesis powered by ClipDrop & Cloudinary, supporting artistic styles (Realistic, Ghibli, Anime, Cyberpunk, 3D Render, Oil Painting) and community feed publishing.
4. **✂️ Background Removal** — Automated foreground cutout extraction with transparent PNG exports.
5. **🪄 Object Removal** — Targeted inpainting and unwanted object erasure (`e_gen_remove`).
6. **📄 AI Resume Reviewer** — PDF resume extraction (`pdf-parse`) and deep ATS-oriented auditing, strength scoring, and section rewrites.
7. **🩺 Clinica (Health Assistant)** — Personalized symptom guidance, lifestyle wellness protocols, and local healthcare provider directory.
8. **📚 Study Assistant** — Dynamic educational deck generation supporting practice Q&As, flashcards, and notes summarization.
9. **🌐 Community Showcase** — Collaborative public gallery to browse, inspect, and like creations shared by creators across the platform.

---

## 🏗️ Technical Architecture

```
[ Frontend: React 19 + Vite 7 + Tailwind 4 ]
                 ↕ (Clerk JWT + Axios)
[ Backend: Node.js + Express 5.1 ]
   ├── Clerk Middleware (Auth & Subscription Tier Guard)
   ├── Multer (Streamlined in-flight file processing & disk cleanup)
   └── API Handlers (/api/ai, /api/user)
                 ↕
[ AI Engines & Infrastructure ]
   ├── NVIDIA Nemotron 3.5 Super VL (OpenAI-compatible endpoints)
   ├── Cloudinary AI & ClipDrop API (Image synthesis & transformations)
   └── Neon Serverless PostgreSQL (Creations & Social Graph)
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** `>= 18.x`
- **npm** or **yarn**
- **Neon PostgreSQL** account & connection URI
- **Clerk** account (Publishable Key + Secret Key)
- **NVIDIA Developer Key** (or Nemotron NIM endpoint)
- **Cloudinary** account (Cloud Name, API Key, API Secret)
- **ClipDrop API Key** (for image synthesis)

---

### Installation

```bash
# Clone the repository
git clone https://github.com/SP4567/AuraAI.git
cd AuraAI

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Environment Setup

#### Server Configuration (`server/.env`):
```env
PORT=5000

# NVIDIA Nemotron Inference
NVIDIA_API_KEY=nvapi-...
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NEMOTRON_MODEL=nvidia/nemotron-3.5-super-vl-120b-a12b

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-...neon.tech/neondb?sslmode=require

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudinary Media
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# ClipDrop API
CLIPDROP_API_KEY=...
```

#### Client Configuration (`client/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BASE_URL=http://localhost:5000/
```

---

### Database Initialization

Execute the schema script located at `server/configs/schema.sql` inside your Neon database console or psql terminal:

```sql
CREATE TABLE IF NOT EXISTS creations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    publish BOOLEAN DEFAULT FALSE,
    likes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations (user_id);
CREATE INDEX IF NOT EXISTS idx_creations_publish ON creations (publish);
CREATE INDEX IF NOT EXISTS idx_creations_created_at ON creations (created_at DESC);
```

---

### Running Locally

Run both client and server in separate terminal sessions:

```bash
# Terminal 1: Backend
cd server
npm run server

# Terminal 2: Frontend
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Repository Structure

```
AuraAI/
├── client/
│   ├── src/
│   │   ├── assets/         # Brand logos, icons, tool metadata
│   │   ├── components/     # Navbar, Sidebar, Hero, CreationItem, ThemeToggle
│   │   ├── context/        # Theme provider & hooks
│   │   ├── pages/          # 9 Tool interfaces, Dashboard, Community, Home
│   │   ├── App.jsx         # Routing & notification toasts
│   │   └── main.jsx        # Clerk & router providers
│   ├── eslint.config.js    # Strict linting config
│   ├── vite.config.js      # Vite 7 build configuration
│   └── package.json
├── server/
│   ├── configs/            # DB client, Cloudinary, Multer, schema.sql
│   ├── controllers/        # AI orchestration & user data controllers
│   ├── middlewares/        # Clerk authentication & plan checks
│   ├── routes/             # /api/ai & /api/user routing
│   ├── server.js           # Express app bootstrap
│   └── package.json
└── README.md
```

---

## 🔒 Security & Best Practices

- **Zero-leaked credentials:** Keys are strictly retrieved from environment variables.
- **Immediate file unlinking:** All temporary disk uploads processed through Multer are automatically cleaned up in `finally` blocks.
- **Strict linting & build compliance:** Code passes `eslint` with zero warnings and Vite production bundling cleanly.

---

## 📜 License

This project is licensed under the **MIT License**.
