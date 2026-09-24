# 🛑 mineos | PIT-GUARD
**Aviation-Grade Heads-Up Display (HUD) for Heavy Earth Moving Machinery (HEMM)**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Status](https://img.shields.io/badge/Status-SIH_2026_Ready-success?style=for-the-badge)

> **The Problem:** In open-pit mines, dense fog, heavy dust, and night operations create zero-visibility blind spots. When drivers of 240-ton Haul Trucks look down at traditional dashboards, fatal vehicle-to-vehicle collisions and terrace edge rollovers happen in seconds.
>
> **The Solution:** We built **mineos (PIT-GUARD)**. By projecting real-time telemetry, chassis balance, and proximity radar directly into the driver's forward field of view, we eliminate cognitive load and guarantee situational awareness when visibility drops to zero.

---

## ✨ Core Features

*   **📡 Live TTC Proximity Radar:** Calculates real-time Time-to-Collision (TTC) based on relative speeds and distances of surrounding vehicles.
*   **⚠️ Dynamic Threat UI:** The "Glass Cockpit" interface remains calm/dark during safe operations, shifts to amber for caution, and violently flashes red (with audio alarms) when TTC drops below 4 seconds.
*   **⚖️ Chassis Inclinometer:** Displays real-time truck incline and tilt angles to prevent catastrophic rollovers on uneven, unpaved mining ramps.
*   **🛣️ Track Alignment Deviation:** A visual slip-indicator ensuring the HEMM remains perfectly centered in narrow, high-risk mining lanes.
*   **🔌 Fault-Tolerant Architecture:** Gracefully handles the notoriously unstable networks of deep mine pits. If the server drops, the UI instantly falls back to a gray offline state to prevent drivers from trusting stale data.

---

## 🏗️ System Architecture

The project is split into a highly decoupled, scalable architecture optimized for rugged edge-computing environments.

1.  **Frontend (`/frontend`)**: A high-performance React & Tailwind CSS dashboard designed for rugged in-cab displays.
2.  **Backend (`/backend`)**: A lightweight Node.js & Express server utilizing Socket.IO to broadcast massive telemetry arrays at ultra-low latency (500ms intervals).

### 📄 The Telemetry Data Contract
The frontend and backend communicate via a strictly typed JSON payload over WebSockets:

```json
{
  "telemetry": { "speed": 35, "altitude": 420, "incline": 5.2, "tilt": -2.1 },
  "environment": { "fogDensity": 85, "visibility": 20 },
  "navigation": { "trackDeviation": -1.5 },
  "radar": [
    { "id": "Truck-4", "distance": 45, "ttc": 3.1 }
  ]
}
