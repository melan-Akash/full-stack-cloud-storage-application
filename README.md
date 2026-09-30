<div align="center">

  <img src="./logo.svg" alt="Drivea Cloud Storage Logo" width="84" height="84" />

  # Drivea — Modern Full-Stack Cloud Storage Platform

  <p align="center">
    <strong>A high-performance, secure, and intuitive cloud storage and file management platform built with React 19, Express, Neon PostgreSQL, and AWS S3 Object Storage.</strong>
  </p>

  <p align="center">
    <a href="https://melanakash.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Author-Melan%20Akash-F54900?style=for-the-badge&logo=vercel&logoColor=white" alt="Author Melan Akash" />
    </a>
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Express 5" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon PostgreSQL" />
    <img src="https://img.shields.io/badge/Storage-AWS_S3_/_Neon-FF9900?style=for-the-badge&logo=amazon-s3&logoColor=white" alt="AWS S3" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  </p>

  <h3>
    <a href="https://melanakash.vercel.app">Portfolio Demo</a>
    <span> | </span>
    <a href="#-key-features">Key Features</a>
    <span> | </span>
    <a href="#-system-architecture">System Architecture</a>
    <span> | </span>
    <a href="#-api-endpoints">API Reference</a>
    <span> | </span>
    <a href="#-getting-started">Getting Started</a>
  </h3>

</div>

---

## 🌟 Overview

**Drivea** is a production-grade, enterprise-ready cloud drive application inspired by industry standards like Google Drive and Dropbox. Engineered with the **PERN stack (PostgreSQL, Express, React, Node.js)** and **S3-compatible Object Storage**, it provides seamless multi-file uploading, recursive folder hierarchy management, real-time transfer tracking, instant ZIP bundling, public link sharing, and soft-delete trash recovery.

Designed with modern glassmorphism aesthetics, responsive layouts, and fluid micro-animations, Drivea is built to demonstrate end-to-end full-stack software craftsmanship.

---

## 🚀 Key Features

### 📤 Drag & Drop Upload Zone
- **Full-Viewport Drag Detection**: Simply drag files from your desktop onto the browser viewport to trigger an animated, glassmorphism drop zone.
- **Dynamic Hierarchy Awareness**: Automatically detects whether files are being dropped into the root drive or a subfolder.
- **Flicker-Free Drag Counter**: Built with an anti-flicker drag event counter algorithm to prevent erratic UI states when hovering over child components.

### ⚡ Live Floating Progress Widget
- **Real-Time Speed Metric**: Calculates upload speed dynamically (e.g., `2.4 MB/s` or `850 KB/s`).
- **Time Remaining Estimation**: Real-time remaining time projection (e.g., `~4s left`).
- **Transfer Volume Tracking**: Accurately shows uploaded bytes vs total payload (e.g., `14.2 MB / 18.0 MB`).
- **Individual File Queue**: Displays per-file status icons, active spinning indicators, and green completion checkmarks.
- **Collapsible Mini-Player**: Bottom-right floating card that can be collapsed, expanded, or dismissed.

### 🔲 Dual View Switcher (Grid & Table List)
- **Grid View**: Clean card-based layout featuring dynamic MIME-type color badges and file metadata.
- **Table List View**: High-density Google Drive-style table displaying Item Name, Type, Size, Last Modified Date, and Inline Actions.
- **Persistent View Preference**: Automatically remembers user preference (`grid` vs `list`) via browser storage.

### 📦 Bulk Actions & In-Browser ZIP Compression
- **Multi-Select Checkboxes**: Select multiple files and folders individually or with "Select All".
- **Floating Dark-Themed Action Bar**: Pops up when items are selected.
- **Download as .ZIP**: Uses `JSZip` to fetch selected files via presigned S3 URLs, archive them in-memory, and trigger an instant ZIP package download.
- **Bulk Operations**: Perform batch moves to another folder, batch favorites, or bulk move to Trash.

### ⭐ Starred & ⏱️ Recent Views
- **Starred Items (`/starred`)**: Bookmark critical files and folders with a single click and access them in a dedicated view.
- **Recent Files (`/recent`)**: Chronologically indexed stream of recently uploaded and modified assets across all subdirectories.

### 🔗 Public Share Links with Granular Access
- Generate unique, secure cryptographic 64-character tokens.
- Choose between **"Download"** and **"View Only"** permissions.
- Public link access page (`/s/:token`) allows unauthenticated users to preview or download files safely without exposing internal storage keys.
- Revoke links anytime from the **Shared Files** management dashboard.

### 🗑️ Soft-Delete & Trash Recovery Lifecycle
- Items moved to trash retain metadata and original directory associations.
- **Recursive Restoration**: Restoring a folder restores all child subfolders and files.
- **Permanent Deletion**: Permanently purging items triggers atomic database removal, S3 bucket key deletion, and user storage quota reclamation.

### 🔐 Secure Authentication & Quota Management
- Password hashing with **Bcrypt** (salt rounds = 10).
- Stateless JWT issuance via **HTTP-only cookies** and fallback Bearer authorization headers for zero cross-origin friction.
- Live storage indicator bar showing exact usage against a 1 GB tier (`storage_used` / `storage_limit`).

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client["Frontend Client (React 19 + Vite)"]
        UI["Modern UI / Tailwind CSS 4"]
        Context["App Context & Auth State"]
        DriveHook["useDrive Hook (State & S3 Uploads)"]
        Axios["Axios API Client (Bearer & Cookies)"]
    end

    subgraph Server["Backend Server (Express 5 + Node.js)"]
        Router["Express API Router (/api/*)"]
        AuthMiddleware["JWT Authentication Guard"]
        Controllers["Controllers (Auth, Files, Folders, Shares, Trash)"]
        StorageService["Storage Hierarchy & S3 Service"]
    end

    subgraph Data["Cloud Infrastructure"]
        Postgres["Neon Serverless PostgreSQL\n(UUID Schema, GIN & B-Tree Indexes)"]
        S3["Neon / AWS S3 Object Storage\n(Presigned URLs & Batch Deletions)"]
    end

    UI --> Context
    Context --> DriveHook
    DriveHook --> Axios
    Axios -->|HTTP REST / multipart| Router
    Router --> AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> StorageService
    Controllers --> Postgres
    StorageService --> Postgres
    StorageService -->|AWS SDK v3| S3
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Description |
|---|---|---|
| **Frontend Core** | **React 19**, **Vite 8** | High-performance SPA with latest React features |
| **Styling** | **Tailwind CSS v4** | Modern utility-first CSS design system |
| **Icons & UI** | **Lucide React** | Consistent, scalable SVG iconography |
| **Compression** | **JSZip** | In-browser client-side file compression for bulk ZIP exports |
| **Notifications** | **React Hot Toast** | Lightweight, animated toast notifications |
| **Backend Core** | **Node.js**, **Express 5** | RESTful backend architecture with native Promise handling |
| **Database** | **PostgreSQL (Neon Serverless)** | Relational database with UUID primary keys and GIN indexes |
| **DB Client** | `@neondatabase/serverless`, `pg` | High-speed serverless pooled database drivers |
| **Cloud Storage** | **AWS S3 SDK v3**, **Neon Object Storage** | S3-compatible bucket storage with presigned URLs |
| **File Uploads** | **Multer (MemoryStorage)** | Streaming memory-buffered multipart form uploads |
| **Security** | **JSON Web Tokens (JWT)**, **Bcrypt.js** | Stateless authentication and password hashing |

---

## 📊 Database Schema Design

Drivea utilizes a robust relational schema with referential integrity and cascading rules:

- **`users`**: `id (UUID)`, `name`, `email`, `password`, `storage_used (BIGINT)`, `storage_limit (BIGINT)`, `created_at`
- **`folders`**: `id (UUID)`, `name`, `parent_id (UUID -> folders.id)`, `owner_id (UUID -> users.id)`, `path (UUID[])`, `is_trashed (BOOL)`, `trashed_at`
- **`files`**: `id (UUID)`, `name`, `original_name`, `mime_type`, `size (BIGINT)`, `s3_key (UNIQUE)`, `folder_id (UUID -> folders.id)`, `owner_id (UUID -> users.id)`, `is_trashed (BOOL)`, `trashed_at`
- **`share_links`**: `id (UUID)`, `token (VARCHAR UNIQUE)`, `resource_type`, `resource_id (UUID)`, `owner_id (UUID)`, `permission`, `access_count (INT)`, `expires_at`

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT cookie/token | No |
| `POST` | `/api/auth/logout` | Invalidate user session cookie | Yes |
| `GET` | `/api/auth/me` | Retrieve profile and live storage quota | Yes |

### 📁 Folders (`/api/folders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/folders?parent_id=...` | List child folders of directory | Yes |
| `POST` | `/api/folders` | Create a new folder (root or nested) | Yes |
| `GET` | `/api/folders/:id` | Get folder details and contents | Yes |
| `POST` / `PATCH` | `/api/folders/:id/rename` | Rename an existing folder | Yes |
| `POST` / `PATCH` | `/api/folders/:id/move` | Move folder into another directory | Yes |
| `DELETE` | `/api/folders/:id` | Soft-delete folder & sub-tree to Trash | Yes |

### 📄 Files (`/api/files`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/files?folder_id=...&sort=...` | List files with sorting options | Yes |
| `POST` | `/api/files/upload` | Multipart file upload to S3 Storage | Yes |
| `GET` | `/api/files/:id/preview` | Generate 1-hour presigned S3 preview URL | Yes |
| `POST` / `PATCH` | `/api/files/:id/rename` | Rename an existing file | Yes |
| `POST` / `PATCH` | `/api/files/:id/move` | Move file to target directory | Yes |
| `DELETE` | `/api/files/:id` | Move file to Trash | Yes |

### 🔗 Public Sharing (`/api/shares` & `/api/share`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/shares` | Generate a shareable public link | Yes |
| `GET` | `/api/share/my-links` | List all active links created by user | Yes |
| `GET` | `/api/share/public/:token` | View shared item metadata & stream URL | No |
| `GET` | `/api/share/download/:token` | Direct file download redirect | No |
| `DELETE` | `/api/share/:id` | Revoke an existing share link | Yes |

### 🗑️ Trash Management (`/api/trash`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/trash` | List all soft-deleted files and folders | Yes |
| `POST` | `/api/trash/restore` | Restore soft-deleted item and contents | Yes |
| `DELETE` | `/api/trash/permanent` | Purge item permanently from S3 & DB | Yes |
| `DELETE` | `/api/trash/empty` | Completely empty user's trash bin | Yes |

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **PostgreSQL Database** (e.g., [Neon.tech](https://neon.tech))
- **S3-Compatible Object Storage** (AWS S3, Neon Object Storage, Cloudflare R2, or MinIO)

### 2. Clone the Repository
```bash
git clone https://github.com/melan-Akash/full-stack-cloud-storage-application.git
cd full-stack-cloud-storage-application
```

### 3. Server Configuration (`/server`)
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@ep-sample-pooler.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_super_secret_jwt_key"
CLIENT_URL="http://localhost:5173"

# Storage Quotas
MAX_FILE_SIZE=104857600          # 100 MB
MAX_STORAGE_PER_USER=1073741824  # 1 GB

# S3 / Neon Object Storage Credentials
AWS_ENDPOINT_URL_S3="https://your-bucket-endpoint.neon.tech"
AWS_ACCESS_KEY_ID="your_s3_access_key"
AWS_SECRET_ACCESS_KEY="your_s3_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="drive-bucket"
```

Start the backend dev server:
```bash
npm run dev
```

### 4. Client Configuration (`/client`)
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_BASE_URL="http://localhost:5000"
```

Start the frontend Vite dev server:
```bash
npm run dev
```

Open your browser at **`http://localhost:5173`** to access Drivea!

---

## 👨‍💻 Author & Connect

Developed with passion by **Melan Akash**.

- 🌐 **Portfolio**: [https://melanakash.vercel.app](https://melanakash.vercel.app)
- 🐙 **GitHub**: [@melan-Akash](https://github.com/melan-Akash)
- 💼 **Project Repository**: [full-stack-cloud-storage-application](https://github.com/melan-Akash/full-stack-cloud-storage-application)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt this project for your portfolio, learning, or commercial endeavors.