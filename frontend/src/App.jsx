import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// NOTE: Change this URL to wherever your backend teammate is running their server!
const BACKEND_URL = 'http://localhost:4000'; 

export default function App() {
  // 1. DATA STATE (This is the default starting data before the backend connects)
  const [data, setData] = useState({
    telemetry: { speed: 0, altitude: 0, incline: 0, tilt: 0 },
    environment: { fogDensity: 0, visibility: 100 },
    navigation: { trackDeviation: 0 }, 
    radar: []
  });

  const [isConnected, setIsConnected] = useState(false);

  // 2. REAL BACKEND CONNECTION (Socket.IO)
  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on('connect', () => {
      console.log('Connected to mineos backend!');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend!');
      setIsConnected(false);
    });

    // This listens for the exact event name from the backend
    socket.on('truck_update', (backendData) => {
      // Updates the UI instantly with real data!
      setData(backendData); 
    });

    // Cleanup when the app closes
    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. COLLISION LOGIC
  const criticalThreat = data.radar.find(v => v.ttc <= 4.0 || v.distance < 15);
  const warningThreat = data.radar.find(v => (v.ttc > 4.0 && v.ttc <= 8.0) || v.distance < 40);

  let uiState = 'normal';
  if (criticalThreat) uiState = 'critical';
  else if (warningThreat) uiState = 'warning';
  if (!isConnected) uiState = 'disconnected'; // Turns screen gray if backend is down

  const theme = {
    normal: 'bg-slate-950 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-950 text-amber-400 border-amber-500/50',
    critical: 'bg-red-950 text-white border-red-500 animate-pulse',
    disconnected: 'bg-gray-900 text-gray-500 border-gray-600',
  };
  
  const activeTheme = theme[uiState] || theme.normal;

  return (
    <div className={`h-screen w-screen p-6 font-mono transition-colors duration-300 ${activeTheme} flex flex-col justify-between overflow-hidden`}>
      
      {/* OVERLAY: CRITICAL WARNING */}
      {uiState === 'critical' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-red-600/20">
          <h1 className="text-9xl font-black uppercase tracking-widest text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,1)]">
            PULL UP / BRAKE
          </h1>
        </div>
      )}

      {/* OVERLAY: NO CONNECTION */}
      {uiState === 'disconnected' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <h1 className="text-5xl font-black uppercase tracking-widest bg-gray-900/80 p-8 rounded-xl">
            WAITING FOR BACKEND CONNECTION...
          </h1>
        </div>
      )}

      {/* TOP ROW: System Status */}
      <div className="flex justify-between items-center text-xl uppercase tracking-widest font-bold opacity-70">
        <div>SYS: mineos</div>
        <div>
          {!isConnected ? 'SYSTEM OFFLINE' :
           uiState === 'normal' ? 'NO THREATS DETECTED' : 
           uiState === 'warning' ? 'CAUTION: PROXIMITY ALERT' : 
           'IMMINENT COLLISION'}
        </div>
        <div>FOG DENsity: {data.environment.fogDensity}%</div>
      </div>

      {/* MAIN HUD DISPLAY */}
      <div className="flex-1 flex justify-between items-center py-10 relative">
        
        {/* LEFT COLUMN: Telemetry */}
        <div className="flex flex-col justify-between h-full w-1/4">
          <div className={`border-l-4 pl-4 ${activeTheme}`}>
            <div className="text-2xl opacity-60">SPEED (KM/H)</div>
            <div className="text-7xl font-black">{Number(data.telemetry.speed).toFixed(0)}</div>
          </div>
          <div className={`border-l-4 pl-4 ${activeTheme}`}>
            <div className="text-2xl opacity-60">ALTITUDE (MSL)</div>
            <div className="text-6xl font-bold">{Number(data.telemetry.altitude).toFixed(0)}m</div>
          </div>
        </div>

        {/* CENTER COLUMN: Chassis Inclinometer & Track Alignment */}
        <div className="w-2/4 flex flex-col items-center justify-center relative">
          
          <div className="mb-10 w-full flex flex-col items-center">
            <div className="text-xl opacity-60 mb-2">ROAD ALIGNMENT</div>
            <div className="w-full h-4 bg-gray-800 rounded-full relative overflow-hidden border border-current">
              <div className="absolute h-full w-1 bg-current left-1/2 -translate-x-1/2 z-10"></div>
              <div 
                className="absolute h-full w-8 bg-current opacity-70 transition-all duration-300"
                style={{ 
                  left: '50%', 
                  transform: `translateX(calc(-50% + ${data.navigation.trackDeviation * 20}px))` 
                }}
              ></div>
            </div>
            <div className="flex justify-between w-full text-sm mt-1 opacity-50">
              <span>LEFT 5M</span><span>CENTER</span><span>RIGHT 5M</span>
            </div>
          </div>

          {/* Truck Chassis Inclinometer (Replaces the airplane graphic) */}
          <div className="text-xl opacity-60 mb-2 mt-4">CHASSIS BALANCE</div>
          <div className="relative w-64 h-64 border-2 border-current rounded-full flex items-center justify-center">
            <div 
              className="absolute w-full h-1 bg-current transition-all duration-200"
              style={{
                transform: `rotate(${data.telemetry.tilt}deg) translateY(${data.telemetry.incline * 2}px)`
              }}
            ></div>
            <div className="absolute w-4 h-4 border-2 border-current rounded-full"></div>
            <div className="absolute w-20 h-1 border-t-2 border-current -left-4"></div>
            <div className="absolute w-20 h-1 border-t-2 border-current -right-4"></div>
          </div>
          
          <div className="flex gap-8 mt-6 text-2xl font-bold">
            <div>INCLINE: {Number(data.telemetry.incline).toFixed(1)}°</div>
            <div>TILT: {Number(data.telemetry.tilt).toFixed(1)}°</div>
          </div>
        </div>

        {/* RIGHT COLUMN: Radar & Threats */}
        <div className="flex flex-col justify-start h-full w-1/4">
          <div className={`border-r-4 pr-4 text-right mb-10 ${activeTheme}`}>
            <div className="text-2xl opacity-60">VISIBILITY</div>
            <div className="text-6xl font-bold">{data.environment.visibility}m</div>
          </div>

          <div className={`border-r-4 pr-4 text-right ${activeTheme}`}>
            <div className="text-2xl opacity-60 mb-4">NEARBY TARGETS</div>
            
            {data.radar.length === 0 && (
              <div className="text-xl opacity-50">NO VEHICLES IN RANGE</div>
            )}

            {data.radar.map((target, idx) => (
              <div key={idx} className={`mb-4 p-3 border border-current ${target.ttc <= 4 ? 'bg-red-500/20' : 'bg-transparent'}`}>
                <div className="text-xl font-bold">{target.id}</div>
                <div className="text-3xl font-black">{Number(target.distance).toFixed(0)}m AHEAD</div>
                <div className="text-xl opacity-80">TTC: {Number(target.ttc).toFixed(1)}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}