<div align="center">

# 🧪 MLMIS

### Medical Laboratory Management & Information System

**A complete, production-ready system for medical blood-testing laboratories.**

Digitize patient records · Automate lab workflows · Generate A4 reports · Notify patients via WhatsApp · Manage finances · Ensure compliance

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [Deployment](#-deployment) · [API Reference](#-api-reference) · [Security](#-security)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Web-lightgrey)

</div>

---

## 📋 Overview

**MLMIS** is a full-stack laboratory information management system designed for single-branch medical laboratories. It handles the complete lifecycle of a patient test — from registration and test booking through result entry, verification, A4 PDF reporting, payment collection, and WhatsApp delivery of reports.

### Key Highlights

- **6 role-based portals** — Admin, Receptionist, Technician, Accountant, Patient, Doctor
- **Manual lab result entry** with configurable parameters, reference ranges, and abnormal flags
- **Verification workflow** — draft → pending → approved/rejected with full audit trail
- **A4 print-ready reports** — optimized for standard A4 printers and PDF export
- **WhatsApp Business Cloud API** integration for automatic report delivery
- **Financial management** — invoices, discounts, payments, expenses, daily/monthly dashboards
- **Real-time notifications** via Socket.IO
- **Electron desktop app** for admin PCs
- **Comprehensive audit logging** for regulatory compliance

---

## ✨ Features

### 👥 Patient Management
- Unique MR number generation (auto)
- Duplicate detection on registration
- Full test history and visit tracking
- Secure patient portal with account linking
- Restricted data isolation (patients see only their own records)

### 🧬 Test Catalog
- Configurable tests and parameters (no hardcoding)
- Support for numeric and qualitative results
- Reference ranges with auto-flagging (L/H/A)
- Test categories (Hematology, Biochemistry, Immunology, Microbiology, Serology)
- Enable/disable tests without deletion

### 📋 Workflow
- **Patient registration** → **Visit creation** → **Test booking** → **Invoice generation**
- **Sample collection** → **Result entry** → **Verification** → **Report release**
- Full timestamped state transitions
- Rejection workflow with reasons
- Result revision tracking (immutable approved reports)

### 📄 Reports & Printing
- A4-optimized HTML for browser printing
- Customizable lab branding (`client/src/config/lab.js`)
- Correct page breaks for multi-page reports
- Print or Save as PDF via native browser (no external PDF library needed)
- Versioned reports (draft, approved, corrected)

### 💰 Financial Management
- Invoice generation with line items
- Authorized discounts
- Full and partial payments
- Outstanding balance tracking
- Refund support
- Expense recording with 8 categories
- Daily/monthly sales dashboards
- Cash flow summaries

### 📱 WhatsApp Integration
- Official Meta WhatsApp Business Cloud API
- Approved message templates
- Delivery status tracking via webhook
- Mock mode for testing without Meta credentials
- Retry handling on failure
- Full message audit log

### 🔌 Real-Time Features
- Socket.IO-based notifications
- Instant patient alerts on result approval
- Live payment notifications for accountants
- Role-scoped event broadcasting

### 🖥️ Portals
- **Admin Desktop** — Electron app for Windows
- **Staff Web Portal** — Responsive React SPA
- **Patient Portal** — Self-service report and invoice access
- **Doctor Portal** — Referred patients only (with explicit referral authorization)

### 🔐 Security & Compliance
- JWT-based authentication
- Role-Based Access Control (RBAC) — 6 roles
- Rate limiting on all endpoints
- Server-side authorization checks (not just frontend hiding)
- Audit logging for all critical operations
- Private PDF storage
- Field-level access restrictions (patients can't see medical data beyond their own)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios |
| **Backend** | Node.js 18+, Express.js |
| **Database** | MongoDB 6+, Mongoose ODM |
| **Real-time** | Socket.IO |
| **Auth** | JWT + bcrypt |
| **WhatsApp** | Meta WhatsApp Business Cloud API |
| **Desktop** | Electron 31, electron-builder |
| **Styling** | Custom CSS (no framework dependency) |
| **Printing** | Browser native (`window.print()`) — no Puppeteer |
| **Deployment** | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 🏗 Architecture
