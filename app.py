from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import threading
import time
import json
import asyncio
from ultralytics import YOLO

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")

print("[INFO] Loading YOLOv8 Model for Mine OS...")
model = YOLO('yolov8n.pt')


state = {
    "speed": 45.0, 
    "distance": 99.9,
    "safe_stop_dist": 0.0,
    "state": "GREEN",
    "throttle": "NORMAL",
    "brakes": 0,
    "hw": {"radar": False, "can": False, "uwb": False}
}

flags = {
    "v2v_override": False,
    "dust_blind": False,
    "active_video": "video1.mp4" 
}

def generate_frames():
    global state, flags
    
    current_video_source = flags["active_video"]
    cap = cv2.VideoCapture(current_video_source)
    was_red = False

    while True:
        if current_video_source != flags["active_video"]:
            cap.release()
            current_video_source = flags["active_video"]
            cap = cv2.VideoCapture(current_video_source)

        ret, frame = cap.read()
        
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame = cv2.resize(frame, (800, 600))
        h, w, _ = frame.shape

        DANGER_ZONE_LEFT = 250
        DANGER_ZONE_RIGHT = 550
        cv2.line(frame, (DANGER_ZONE_LEFT, h), (350, 200), (255, 255, 255), 2)
        cv2.line(frame, (DANGER_ZONE_RIGHT, h), (450, 200), (255, 255, 255), 2)
        cv2.putText(frame, "ACTIVE BRAKING TRACK", (310, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        min_distance = 99.0
        v_ms = state["speed"] / 3.6 
        friction_dirt = 0.4 
        gravity = 9.81
        
        reaction_dist = v_ms * 1.0 
        braking_dist = (v_ms**2) / (2 * friction_dirt * gravity)
        safe_stop_distance = round(reaction_dist + braking_dist, 1)
        state["safe_stop_dist"] = safe_stop_distance

        if flags["dust_blind"]:
            frame = cv2.GaussianBlur(frame, (75, 75), 0)
            overlay = np.full((h, w, 3), (40, 100, 160), dtype=np.uint8)
            frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
            cv2.putText(frame, "RADAR FALLBACK ACTIVE", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            min_distance = 4.5 
        else:
            results = model(frame, verbose=False)
            for box in results[0].boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                box_center_x = (x1 + x2) / 2
                
                if DANGER_ZONE_LEFT < box_center_x < DANGER_ZONE_RIGHT:
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                    box_area = (x2 - x1) * (y2 - y1)
                    sim_dist = max(1.0, 100000 / float(box_area))
                    min_distance = min(min_distance, sim_dist)
                else:
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (100, 100, 100), 1)

        state["distance"] = round(min_distance, 1)

        if flags["v2v_override"] or min_distance <= safe_stop_distance:
            state["state"] = "RED"
            state["throttle"] = "CUT (0% TORQUE)"
        elif min_distance <= (safe_stop_distance + 15.0): 
            state["state"] = "YELLOW"
            state["throttle"] = "DERATE (50%)"
        else:
            state["state"] = "GREEN"
            state["throttle"] = "NORMAL"

        if state["state"] == "RED" and not was_red:
            state["brakes"] += 1
            was_red = True
        elif state["state"] != "RED":
            was_red = False

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.get("/", response_class=HTMLResponse)
async def serve_ui(request: Request):
    return templates.TemplateResponse(request=request, name="index.html", context={"request": request})

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps(state))
            await asyncio.sleep(0.1)
    except:
        pass

@app.post("/toggle_dust")
def toggle_dust():
    flags["dust_blind"] = not flags["dust_blind"]
    return {"status": "success"}

@app.post("/toggle_video")
def toggle_video():
    flags["active_video"] = "video2.mp4" if flags["active_video"] == "video1.mp4" else "video1.mp4"
    return {"status": "success"}

@app.post("/trigger_v2v")
def trigger_v2v():
    flags["v2v_override"] = True
    threading.Thread(target=lambda: (time.sleep(3), flags.update(v2v_override=False)), daemon=True).start()
    return {"status": "success"}

@app.post("/sync_weighbridge")
def sync_weighbridge():
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)