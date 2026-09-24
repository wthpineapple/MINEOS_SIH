<div align="center">

# 🚧 MINE OS (Level 9 CAS)
### Edge-Native Proximity Detection & Electronic Powertrain Derating

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Inference-FF9900.svg?logo=ultralytics&logoColor=white)](https://docs.ultralytics.com)
[![Protocol](https://img.shields.io/badge/CAN--Bus-SAE_J1939_TSC1-lightgrey.svg)]()
[![Standard](https://img.shields.io/badge/EMESRT-Level_9_Intervention-green.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*An offline, safety-critical edge architecture engineered to eliminate false alarms and prevent heavy hauler jackknifing in zero-visibility opencast mining operations.*

---

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Physics & Actuation](#-physics--actuation-engine) • [Quick Start](#-quick-start) • [Repository Structure](#-repository-structure) • [Compliance](#-compliance--audit)

</div>

---

## 📌 Executive Summary

Current proximity detection solutions in opencast mines rely on static-distance ultrasonic/radar buzzers that trigger chronic driver **alarm fatigue**. When emergency systems intervene mechanically on a 100-ton haul truck travelling at 40 km/h, the sudden wheel-lock frequently induces catastrophic **chassis jackknifing, rollover, or driveline shearing**.

**Mine OS** bypasses legacy mechanical brake tripping entirely. Acting as an in-cab edge controller, it runs real-time kinematic calculations across a dynamic lateral hazard corridor, issuing high-priority **SAE J1939 CAN-Bus Torque/Speed Control (TSC1)** messages directly to the Engine Control Unit (ECU) to electronically derate engine torque to **0%** smoothly and predictably.

---

## ⚡ Key Features

*   **Deterministic Sensor Fusion (Dust Penetration):** If heavy mining dust or ambient fog degrades optical confidence below baseline thresholds, spatial authority automatically shifts from the YOLOv8 visual classifier to an FMCW 77GHz mmWave radar telemetry pipeline.
*   **Active Braking Track (Spatial Corridor):** Projects an adaptive geometric corridor onto the driving path. Perimeter assets, parallel haulers, and berm-side workers outside the vehicle's dynamic swept path are filtered out to guarantee zero false-positive interventions.
*   **Dynamic Kinematic Physics:** Calculates real-time stopping distances as a direct function of current wheel speed and degraded dirt-road friction coefficients ($\mu = 0.4$), avoiding static distance assumptions.
*   **Electronic Powertrain Derate (EMESRT L9):** Intercepts driver throttle pedal input electronically via CAN-Bus PGN 000000 overrides rather than locking pneumatic/hydraulic wheel brakes.
*   **Store-and-Forward Edge Telemetry:** Built completely independent of cellular or cloud infrastructure. Telemetry and intervention events are logged locally in an embedded ACID-compliant SQLite cache and synchronized asynchronously when crossing weighbridge Wi-Fi gateways.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph SENSORS["1. Sensor & Perception Layer"]
        CAM["HD Optical Camera<br/>(Visual Classifier)"]
        RADAR["77GHz mmWave Radar<br/>(Dust Penetration Engine)"]
        CAN_IN["J1939 Vehicle Bus<br/>(Wheel Speed & Dynamics)"]
    end

    subgraph HAL["2. Edge Compute & Sensor Fusion"]
        YOLO["YOLOv8 Inference Engine<br/>(Hauler / Worker Classification)"]
        RADAR_DEC["Point-Cloud Signal Decoder<br/>(Range / Doppler Velocity)"]
        FUSION["Deterministic Fusion Gate<br/>(Dynamic Confidence Arbitrator)"]
    end

    subgraph DECISION["3. Safety Engine & Kinematics"]
        TRACK["Active Braking Track<br/>(Lateral Trajectory Filter)"]
        PHYSICS["Kinematic Physics Engine<br/>(Dynamic Stopping Distance)"]
        STATE_MACHINE{"EMESRT L9 State Machine<br/>Green / Yellow / Red"}
    end

    subgraph ACTUATION["4. Vehicle Powertrain Control"]
        J1939_OUT["J1939 CAN Controller<br/>(PGN 000000 / TSC1)"]
        ECU["Engine Control Unit (ECU)<br/>(Torque Derated to 0%)"]
    end

    subgraph HUD["5. In-Cab Digital Twin"]
        FASTAPI["FastAPI WebSocket Hub<br/>(Local Edge Server)"]
        UI["In-Cab HUD Interface<br/>(Telemetry & Stream Display)"]
    end

    CAM --> YOLO
    RADAR --> RADAR_DEC
    CAN_IN --> FUSION

    YOLO --> FUSION
    RADAR_DEC --> FUSION
    FUSION --> TRACK
    TRACK --> PHYSICS
    PHYSICS --> STATE_MACHINE

    STATE_MACHINE -- "RED: Critical Threat" --> J1939_OUT
    J1939_OUT --> ECU

    STATE_MACHINE --> FASTAPI
    FASTAPI --> UI

    style SENSORS fill:#161b22,stroke:#30363d,stroke-width:1px,color:#c9d1d9
    style HAL fill:#161b22,stroke:#30363d,stroke-width:1px,color:#c9d1d9
    style DECISION fill:#161b22,stroke:#d29922,stroke-width:1px,color:#c9d1d9
    style ACTUATION fill:#161b22,stroke:#f85149,stroke-width:1px,color:#c9d1d9
    style HUD fill:#161b22,stroke:#58a6ff,stroke-width:1px,color:#c9d1d9
