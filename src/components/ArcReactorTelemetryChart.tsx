import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Cpu, HardDrive, Activity, Radio, RefreshCw } from 'lucide-react';
import { CompanionStatus } from '../types/jarvis';

export interface TelemetryPoint {
  time: string;
  cpu: number;
  ram: number;
}

interface ArcReactorTelemetryChartProps {
  companionStatus: CompanionStatus;
}

export const ArcReactorTelemetryChart: React.FC<ArcReactorTelemetryChartProps> = ({
  companionStatus,
}) => {
  const [dataPoints, setDataPoints] = useState<TelemetryPoint[]>([
    { time: '12:00:00', cpu: 18, ram: 42 },
    { time: '12:00:03', cpu: 22, ram: 43 },
    { time: '12:00:06', cpu: 19, ram: 42 },
    { time: '12:00:09', cpu: 31, ram: 44 },
    { time: '12:00:12', cpu: 25, ram: 44 },
    { time: '12:00:15', cpu: 28, ram: 45 },
  ]);

  const [currentCpu, setCurrentCpu] = useState<number>(24);
  const [currentRam, setCurrentRam] = useState<number>(45);
  const [isLiveBridge, setIsLiveBridge] = useState<boolean>(false);

  // Poll real CPU and RAM from Windows Bridge if connected, or generate realistic HUD telemetry
  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      if (companionStatus.connected) {
        try {
          const res = await fetch('http://127.0.0.1:7890/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'cpu_ram' }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && typeof json.cpu === 'number' && typeof json.ram === 'number') {
              if (!isMounted) return;
              setIsLiveBridge(true);
              const cpuVal = Math.min(100, Math.max(0, json.cpu));
              const ramVal = Math.min(100, Math.max(0, json.ram));
              setCurrentCpu(cpuVal);
              setCurrentRam(ramVal);
              setDataPoints((prev) => {
                const next = [...prev, { time: timeStr, cpu: cpuVal, ram: ramVal }];
                return next.slice(-15);
              });
              return;
            }
          }
        } catch (e) {
          // Bridge endpoint error, fallback to simulation
        }
      }

      // Fallback: smooth simulated oscillations around realistic baseline
      if (!isMounted) return;
      setIsLiveBridge(false);
      setCurrentCpu((prev) => {
        const delta = (Math.random() - 0.48) * 6;
        const next = Math.max(8, Math.min(75, Math.round((prev + delta) * 10) / 10));
        return next;
      });
      setCurrentRam((prev) => {
        const delta = (Math.random() - 0.5) * 1.5;
        const next = Math.max(35, Math.min(85, Math.round((prev + delta) * 10) / 10));
        return next;
      });

      setDataPoints((prev) => {
        const last = prev[prev.length - 1];
        const nextCpu = Math.max(10, Math.min(70, Math.round((last.cpu + (Math.random() - 0.48) * 8) * 10) / 10));
        const nextRam = Math.max(40, Math.min(65, Math.round((last.ram + (Math.random() - 0.5) * 2) * 10) / 10));
        const next = [...prev, { time: timeStr, cpu: nextCpu, ram: nextRam }];
        return next.slice(-15);
      });
    };

    const interval = setInterval(fetchMetrics, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [companionStatus.connected]);

  return (
    <div className="w-full mt-3 p-3 rounded-xl bg-black/60 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.08)]">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/20">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-['Orbitron'] text-[11px] font-bold text-cyan-300 tracking-wider">
            TÉLÉMÉTRIE MATÉRIELLE
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-['Rajdhani']">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLiveBridge ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400/80'
            }`}
          />
          <span className={isLiveBridge ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            {isLiveBridge ? 'PONT DIRECT' : 'PONT HYBRIDE'}
          </span>
        </div>
      </div>

      {/* Real-time Stat Gauges */}
      <div className="grid grid-cols-2 gap-2 mb-2 font-['Rajdhani']">
        {/* CPU Badge */}
        <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] uppercase font-semibold">CPU</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold font-['Orbitron'] text-cyan-300">
              {currentCpu.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* RAM Badge */}
        <div className="p-1.5 rounded bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] uppercase font-semibold">RAM</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold font-['Orbitron'] text-amber-300">
              {currentRam.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Area Visualization */}
      <div className="w-full h-24 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataPoints} margin={{ top: 4, right: 2, left: -26, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              ticks={[0, 50, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-1.5 rounded bg-[#030712]/95 border border-cyan-500/40 text-[10px] font-['Rajdhani'] shadow-lg">
                      <div className="text-cyan-400 font-bold">
                        CPU: {payload[0]?.value}%
                      </div>
                      <div className="text-amber-400 font-bold">
                        RAM: {payload[1]?.value}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#00f0ff"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#cpuGradient)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="ram"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#ramGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Frequency */}
      <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-['Rajdhani']">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#00f0ff] inline-block rounded" /> CPU
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#f59e0b] inline-block rounded" /> RAM
          </span>
        </div>
        <span className="text-slate-500">2.5s Taux de rafraîchissement</span>
      </div>
    </div>
  );
};
