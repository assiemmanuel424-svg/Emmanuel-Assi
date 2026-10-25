import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Cpu,
  Bot,
  Sparkles,
  ChevronRight,
  Crosshair,
} from 'lucide-react';
import {
  ForexPairSymbol,
  ForexPairData,
  ForexPosition,
  ForexTradeHistoryItem,
  ForexStrategy,
  ForexAccountState,
  ForexAiSignal,
  CandleStick,
} from '../types/jarvis';

interface ForexTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePrompt?: (prompt: string) => void;
  onSpeak?: (text: string) => void;
  initialPair?: ForexPairSymbol;
}

const FOREX_PAIRS_CATALOG: Array<{ symbol: ForexPairSymbol; name: string; base: number; spread: number }> = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', base: 1.0864, spread: 0.8 },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar', base: 1.2942, spread: 1.1 },
  { symbol: 'USD/JPY', name: 'US Dollar / Yen', base: 153.25, spread: 1.2 },
  { symbol: 'AUD/USD', name: 'Aussie / US Dollar', base: 0.6580, spread: 1.0 },
  { symbol: 'USD/CAD', name: 'US Dollar / CAD', base: 1.3855, spread: 1.3 },
  { symbol: 'USD/CHF', name: 'US Dollar / Franc', base: 0.8675, spread: 1.2 },
  { symbol: 'GBP/JPY', name: 'Pound / Yen', base: 198.35, spread: 1.8 },
  { symbol: 'EUR/GBP', name: 'Euro / Pound', base: 0.8395, spread: 0.9 },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', base: 2735.50, spread: 2.5 },
];

export const ForexTradingModal: React.FC<ForexTradingModalProps> = ({
  isOpen,
  onClose,
  onExecutePrompt,
  onSpeak,
  initialPair = 'EUR/USD',
}) => {
  // Active trading pair & timeframes
  const [selectedPair, setSelectedPair] = useState<ForexPairSymbol>(initialPair);
  const [timeframe, setTimeframe] = useState<'M1' | 'M5' | 'M15' | 'H1' | 'D1'>('M5');
  const [activeTab, setActiveTab] = useState<'terminal' | 'positions' | 'history' | 'ai_analysis' | 'broker'>('terminal');

  // Rates and market state
  const [pairsData, setPairsData] = useState<Record<string, ForexPairData>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Account State (Stored in localStorage for persistence)
  const [account, setAccount] = useState<ForexAccountState>(() => {
    try {
      const saved = localStorage.getItem('jarvis_forex_account');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      balance: 10000.0,
      equity: 10000.0,
      freeMargin: 10000.0,
      usedMargin: 0.0,
      marginLevelPercent: 0.0,
      leverage: 100,
      currency: 'USD',
      isAutoTradingActive: false,
      activeStrategy: 'scalping',
      riskPerTradePercent: 1.5,
      maxDailyDrawdownPercent: 5.0,
      brokerMode: 'simulation',
    };
  });

  // Positions and History
  const [positions, setPositions] = useState<ForexPosition[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_forex_positions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [tradeHistory, setTradeHistory] = useState<ForexTradeHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_forex_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Order input parameters
  const [orderLotSize, setOrderLotSize] = useState<number>(0.1);
  const [customSlPips, setCustomSlPips] = useState<number>(20);
  const [customTpPips, setCustomTpPips] = useState<number>(40);

  // AI Analysis & Autonomous Trading Logs
  const [aiSignal, setAiSignal] = useState<ForexAiSignal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoLogs, setAutoLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'buy' | 'sell' | 'tp' | 'sl' }>>([]);
  const [hoveredCandle, setHoveredCandle] = useState<CandleStick | null>(null);

  // Persist account and trades
  useEffect(() => {
    localStorage.setItem('jarvis_forex_account', JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem('jarvis_forex_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('jarvis_forex_history', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  // Fetch rates on mount and poll every 1.5 seconds for live market ticks
  const fetchRates = async () => {
    try {
      const res = await fetch('/api/jarvis/forex/rates');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.rates)) {
        const mapped: Record<string, ForexPairData> = {};
        for (const item of data.rates) {
          mapped[item.symbol] = item;
        }
        setPairsData(mapped);
        setIsLoadingRates(false);
      }
    } catch (e) {
      console.warn('Erreur récupération taux forex:', e);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchRates();
    const interval = setInterval(fetchRates, 1500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Current pair data
  const currentPairData = useMemo(() => {
    return pairsData[selectedPair] || {
      symbol: selectedPair,
      name: 'Actif Forex',
      bid: 1.0864,
      ask: 1.0865,
      spreadPips: 0.8,
      change24hPercent: 0.24,
      high24h: 1.0895,
      low24h: 1.0832,
      digits: selectedPair.includes('JPY') ? 3 : (selectedPair.includes('XAU') ? 2 : 5),
      candles: [],
    };
  }, [pairsData, selectedPair]);

  // Helper for pip calculation
  const getPipValue = (symbol: ForexPairSymbol) => {
    if (symbol.includes('JPY')) return 0.01;
    if (symbol.includes('XAU')) return 0.1;
    return 0.0001;
  };

  // Recompute Floating P&L for all active positions on every tick
  useEffect(() => {
    if (positions.length === 0) {
      setAccount((prev) => ({
        ...prev,
        equity: prev.balance,
        freeMargin: prev.balance,
        usedMargin: 0,
        marginLevelPercent: 0,
      }));
      return;
    }

    let totalFloating = 0;
    let totalMargin = 0;
    const pip = getPipValue(selectedPair);

    const updatedPositions = positions.map((pos) => {
      const market = pairsData[pos.pair] || currentPairData;
      const currentPrice = pos.type === 'BUY' ? market.bid : market.ask;
      const pipsDiff = pos.type === 'BUY'
        ? (currentPrice - pos.openPrice) / pip
        : (pos.openPrice - currentPrice) / pip;
      
      // Standard forex lot = $10 per pip on 1.0 standard lot EUR/USD
      const pipMultiplier = pos.pair.includes('XAU') ? 100 : (pos.pair.includes('JPY') ? 8.5 : 10);
      const profit = pipsDiff * pos.lotSize * pipMultiplier;

      // Required margin: (lotSize * 100,000 / leverage)
      const requiredMargin = (pos.lotSize * 100000) / account.leverage;
      totalMargin += requiredMargin;
      totalFloating += profit;

      // Check auto TP / SL triggers
      if (pos.takeProfit) {
        if ((pos.type === 'BUY' && currentPrice >= pos.takeProfit) ||
            (pos.type === 'SELL' && currentPrice <= pos.takeProfit)) {
          setTimeout(() => closePosition(pos.id, 'TP_HIT'), 10);
        }
      }
      if (pos.stopLoss) {
        if ((pos.type === 'BUY' && currentPrice <= pos.stopLoss) ||
            (pos.type === 'SELL' && currentPrice >= pos.stopLoss)) {
          setTimeout(() => closePosition(pos.id, 'SL_HIT'), 10);
        }
      }

      return {
        ...pos,
        currentPrice,
        floatingPnl: Number(profit.toFixed(2)),
        floatingPips: Number(pipsDiff.toFixed(1)),
      };
    });

    setPositions(updatedPositions);

    const newEquity = Number((account.balance + totalFloating).toFixed(2));
    const freeMargin = Number(Math.max(0, newEquity - totalMargin).toFixed(2));
    const marginLevel = totalMargin > 0 ? (newEquity / totalMargin) * 100 : 0;

    setAccount((prev) => ({
      ...prev,
      equity: newEquity,
      usedMargin: Number(totalMargin.toFixed(2)),
      freeMargin,
      marginLevelPercent: Number(marginLevel.toFixed(1)),
    }));
  }, [pairsData]);

  // Place Manual or AI Order
  const placeOrder = (type: 'BUY' | 'SELL', customLots?: number, isAuto: boolean = false) => {
    const lot = customLots || orderLotSize;
    const pip = getPipValue(selectedPair);
    const entryPrice = type === 'BUY' ? currentPairData.ask : currentPairData.bid;

    const stopLossPrice = customSlPips > 0
      ? Number((type === 'BUY' ? entryPrice - customSlPips * pip : entryPrice + customSlPips * pip).toFixed(currentPairData.digits))
      : undefined;

    const takeProfitPrice = customTpPips > 0
      ? Number((type === 'BUY' ? entryPrice + customTpPips * pip : entryPrice - customTpPips * pip).toFixed(currentPairData.digits))
      : undefined;

    const newPos: ForexPosition = {
      id: `pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pair: selectedPair,
      type,
      lotSize: lot,
      openPrice: entryPrice,
      currentPrice: entryPrice,
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      floatingPnl: 0,
      floatingPips: 0,
      openTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isAutoTrade: isAuto,
    };

    setPositions((prev) => [newPos, ...prev]);

    const logMsg = `Ordre ${type} exécuté : ${lot} lot(s) sur ${selectedPair} à ${entryPrice} (SL: ${stopLossPrice || 'Aucun'} | TP: ${takeProfitPrice || 'Aucun'})`;
    setAutoLogs((prev) => [
      {
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: logMsg,
        type: type === 'BUY' ? 'buy' : 'sell',
      },
      ...prev.slice(0, 40),
    ]);

    if (onSpeak && !isAuto) {
      onSpeak(`Ordre ${type === 'BUY' ? "d'achat" : 'de vente'} exécuté sur ${selectedPair} à ${entryPrice}.`);
    }
  };

  // Close an open position
  const closePosition = (id: string, reason: 'MANUAL' | 'TP_HIT' | 'SL_HIT' | 'AUTOPILOT' = 'MANUAL') => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const realizedPnl = pos.floatingPnl;
    const realizedPips = pos.floatingPips;

    const historyRecord: ForexTradeHistoryItem = {
      id: `trade-${Date.now()}`,
      pair: pos.pair,
      type: pos.type,
      lotSize: pos.lotSize,
      openPrice: pos.openPrice,
      closePrice: pos.currentPrice,
      realizedPnl,
      realizedPips,
      openTime: pos.openTime,
      closeTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      closeReason: reason,
    };

    setTradeHistory((prev) => [historyRecord, ...prev]);
    setPositions((prev) => prev.filter((p) => p.id !== id));

    // Update balance
    setAccount((prev) => {
      const newBal = Number((prev.balance + realizedPnl).toFixed(2));
      return {
        ...prev,
        balance: newBal,
        equity: newBal,
      };
    });

    const isProfit = realizedPnl >= 0;
    setAutoLogs((prev) => [
      {
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `Position ${pos.pair} clôturée [${reason}]. Résultat : ${isProfit ? '+' : ''}${realizedPnl} $ (${realizedPips > 0 ? '+' : ''}${realizedPips} pips)`,
        type: reason === 'TP_HIT' ? 'tp' : (reason === 'SL_HIT' ? 'sl' : 'info'),
      },
      ...prev.slice(0, 40),
    ]);
  };

  // Close all positions
  const closeAllPositions = () => {
    positions.forEach((p) => closePosition(p.id, 'MANUAL'));
    if (onSpeak) {
      onSpeak("Toutes les positions ouvertes ont été clôturées avec succès, Monsieur.");
    }
  };

  // Request AI Quantitative Market Analysis
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/jarvis/forex/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedPair,
          strategy: account.activeStrategy,
          timeframe,
          currentPrice: currentPairData.bid,
        }),
      });
      const data = await res.json();
      if (data.success && data.signal) {
        setAiSignal(data.signal);
        if (onSpeak) {
          onSpeak(`Analyse achevée pour ${selectedPair} : signal ${data.signal.action} détecté avec un indice de confiance de ${Math.round(data.signal.confidence * 100)} pour cent.`);
        }
      }
    } catch (e) {
      console.warn('Erreur analyse IA:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Autonomous Trading Engine Loop (when account.isAutoTradingActive is true)
  useEffect(() => {
    if (!account.isAutoTradingActive || !isOpen) return;

    const autoTradingInterval = setInterval(async () => {
      // Avoid over-leveraging: Max 3 concurrent positions in auto mode
      if (positions.length >= 3) return;

      try {
        const res = await fetch('/api/jarvis/forex/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: selectedPair,
            strategy: account.activeStrategy,
            timeframe,
            currentPrice: currentPairData.bid,
          }),
        });
        const data = await res.json();
        if (data.success && data.signal) {
          const sig = data.signal;
          // Trigger order if high confidence
          if (sig.confidence >= 0.85) {
            if (sig.action === 'STRONG_BUY' || sig.action === 'BUY') {
              const lots = Number(((account.balance * (account.riskPerTradePercent / 100)) / 200).toFixed(2));
              placeOrder('BUY', Math.max(0.05, Math.min(1.0, lots)), true);
            } else if (sig.action === 'STRONG_SELL' || sig.action === 'SELL') {
              const lots = Number(((account.balance * (account.riskPerTradePercent / 100)) / 200).toFixed(2));
              placeOrder('SELL', Math.max(0.05, Math.min(1.0, lots)), true);
            }
          }
        }
      } catch (err) {
        console.warn('Auto trading loop tick error:', err);
      }
    }, 12000); // scans every 12 seconds

    return () => clearInterval(autoTradingInterval);
  }, [account.isAutoTradingActive, selectedPair, positions.length, isOpen, account.activeStrategy]);

  // SVG Chart Dimensions & Calculations
  const candles = currentPairData.candles || [];
  const minPrice = useMemo(() => {
    if (!candles.length) return currentPairData.bid * 0.998;
    return Math.min(...candles.map((c) => c.low));
  }, [candles, currentPairData.bid]);

  const maxPrice = useMemo(() => {
    if (!candles.length) return currentPairData.bid * 1.002;
    return Math.max(...candles.map((c) => c.high));
  }, [candles, currentPairData.bid]);

  const priceRange = maxPrice - minPrice || 0.001;
  const chartHeight = 260;
  const chartWidth = 620;

  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * (chartHeight - 40) - 20;
  };

  const candleWidth = 10;
  const candleGap = 6;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden text-slate-100">
        
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <TrendingUp className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wider text-cyan-300 uppercase">
                  Terminal Forex Haute Fréquence // J.A.R.V.I.S.
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIVE TICK 100Hz
                </span>
                {account.isAutoTradingActive && (
                  <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 animate-pulse flex items-center space-x-1">
                    <Bot className="w-3 h-3 inline mr-1" />
                    BOT ACTIF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Trading autonome, calcul de spread en pips & analyse quantitative institutionnelle Stark
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto Trading Master Switch */}
            <button
              onClick={() => {
                const nextState = !account.isAutoTradingActive;
                setAccount((prev) => ({ ...prev, isAutoTradingActive: nextState }));
                if (onSpeak) {
                  onSpeak(nextState ? "Trading autonome Forex activé. J'analyse les flux et place les ordres selon votre profil de risque." : "Trading autonome suspendu.");
                }
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                account.isAutoTradingActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Bot className={`w-3.5 h-3.5 ${account.isAutoTradingActive ? 'text-cyan-400 animate-spin' : ''}`} />
              <span>{account.isAutoTradingActive ? 'Trading Autonome : ON' : 'Trading Autonome : OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Account Bar (Balance, Equity, P&L, Leverage) */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 px-5 py-2.5 bg-slate-900/60 border-b border-cyan-900/40 text-xs">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Solde Compte</span>
            <span className="font-mono font-bold text-sm text-white">
              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Fonds Propres (Equity)</span>
            <span className={`font-mono font-bold text-sm ${account.equity >= account.balance ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">P&L Flottant</span>
            <span className={`font-mono font-bold text-sm ${account.equity - account.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {account.equity - account.balance >= 0 ? '+' : ''}
              ${(account.equity - account.balance).toFixed(2)}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Marge Disponible</span>
            <span className="font-mono font-bold text-sm text-cyan-300">
              ${account.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Positions Ouvertes</span>
            <span className="font-mono font-bold text-sm text-amber-300 flex items-center justify-between">
              {positions.length}
              {positions.length > 0 && (
                <button
                  onClick={closeAllPositions}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline font-sans ml-1"
                >
                  Tout fermer
                </button>
              )}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Effet de Levier</span>
              <span className="font-mono font-bold text-sm text-purple-300">1:{account.leverage}</span>
            </div>
            <select
              value={account.leverage}
              onChange={(e) => setAccount((prev) => ({ ...prev, leverage: Number(e.target.value) }))}
              className="bg-slate-900 border border-slate-700 text-[10px] rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
            >
              <option value="30">1:30</option>
              <option value="100">1:100</option>
              <option value="200">1:200</option>
              <option value="500">1:500</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-900/40 bg-slate-950 px-5 gap-2 pt-2">
          {[
            { id: 'terminal', label: 'Graphique & Ordres', icon: Activity },
            { id: 'positions', label: `Positions Actives (${positions.length})`, icon: Layers },
            { id: 'history', label: `Historique (${tradeHistory.length})`, icon: BarChart2 },
            { id: 'ai_analysis', label: 'Scanner Quantitatif IA', icon: Sparkles },
            { id: 'broker', label: 'Broker & Clés API', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-t border-x ${
                  isActive
                    ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/50 shadow-[0_-2px_10px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'terminal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Pair Watchlist & Selector (3 cols) */}
              <div className="lg:col-span-3 space-y-2">
                <div className="flex items-center justify-between pb-1 text-xs text-slate-400 border-b border-slate-800">
                  <span className="font-semibold uppercase tracking-wider">Actifs Forex</span>
                  <span className="font-mono text-[10px]">Spread</span>
                </div>

                <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
                  {FOREX_PAIRS_CATALOG.map((item) => {
                    const symbol = item.symbol;
                    const data = pairsData[symbol] || {
                      symbol,
                      name: item.name,
                      bid: item.base,
                      ask: item.base,
                      spreadPips: item.spread,
                      change24hPercent: 0.15,
                    };
                    const isSelected = selectedPair === symbol;
                    const isUp = (data.change24hPercent || 0) >= 0;

                    return (
                      <button
                        key={symbol}
                        onClick={() => setSelectedPair(symbol)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-xs text-white">{symbol}</span>
                            {symbol.includes('XAU') && (
                              <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">OR</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Bid: {data.bid}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-mono font-semibold block ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}{data.change24hPercent}%
                          </span>
                          <span className="text-[10px] text-cyan-400/80 font-mono">
                            {data.spreadPips} pips
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle Column: Interactive SVG Chart (6 cols) */}
              <div className="lg:col-span-6 space-y-3">
                {/* Chart Header Bar */}
                <div className="flex flex-wrap items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold font-mono text-cyan-300">{selectedPair}</span>
                    <span className="text-xs font-mono text-slate-300">
                      {currentPairData.bid} / {currentPairData.ask}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Spread: {currentPairData.spreadPips} pips
                    </span>
                  </div>

                  {/* Timeframes */}
                  <div className="flex space-x-1">
                    {(['M1', 'M5', 'M15', 'H1', 'D1'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                          timeframe === tf
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Candlestick Canvas */}
                <div className="relative w-full h-[270px] bg-slate-950/90 rounded-xl border border-slate-800 p-2 overflow-hidden flex flex-col justify-between">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-10">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border-r border-b border-cyan-400" />
                    ))}
                  </div>

                  {/* SVG Candles */}
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full cursor-crosshair"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="bullishGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="bearishRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>

                    {/* EMA 20 line simulation */}
                    <path
                      d={candles.reduce((acc, c, idx) => {
                        const x = idx * (candleWidth + candleGap) + 15;
                        const y = getY(c.close);
                        return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                      }, '')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />

                    {/* Candlesticks */}
                    {candles.map((candle, idx) => {
                      const isBullish = candle.close >= candle.open;
                      const x = idx * (candleWidth + candleGap) + 15;
                      const yHigh = getY(candle.high);
                      const yLow = getY(candle.low);
                      const yOpen = getY(candle.open);
                      const yClose = getY(candle.close);
                      const candleTop = Math.min(yOpen, yClose);
                      const candleHeight = Math.max(2, Math.abs(yClose - yOpen));

                      return (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredCandle(candle)}
                          onMouseLeave={() => setHoveredCandle(null)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          {/* Wick */}
                          <line
                            x1={x + candleWidth / 2}
                            y1={yHigh}
                            x2={x + candleWidth / 2}
                            y2={yLow}
                            stroke={isBullish ? '#10b981' : '#ef4444'}
                            strokeWidth="1.2"
                          />
                          {/* Body */}
                          <rect
                            x={x}
                            y={candleTop}
                            width={candleWidth}
                            height={candleHeight}
                            fill={isBullish ? 'url(#bullishGreen)' : 'url(#bearishRed)'}
                            rx="1"
                          />
                        </g>
                      );
                    })}

                    {/* Current Price Line */}
                    <line
                      x1="0"
                      y1={getY(currentPairData.bid)}
                      x2={chartWidth}
                      y2={getY(currentPairData.bid)}
                      stroke="#06b6d4"
                      strokeDasharray="4 2"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - 65}
                      y={getY(currentPairData.bid) - 4}
                      fill="#06b6d4"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {currentPairData.bid}
                    </text>
                  </svg>

                  {/* Hover telemetry tooltip */}
                  {hoveredCandle && (
                    <div className="absolute top-2 left-3 px-2 py-1 bg-slate-900/90 border border-slate-700 rounded text-[10px] font-mono text-slate-300 flex space-x-3 pointer-events-none">
                      <span>T: {hoveredCandle.time}</span>
                      <span>O: {hoveredCandle.open}</span>
                      <span>H: {hoveredCandle.high}</span>
                      <span>L: {hoveredCandle.low}</span>
                      <span>C: {hoveredCandle.close}</span>
                      <span>Vol: {hoveredCandle.volume}</span>
                    </div>
                  )}

                  {/* Chart Sub-Bar with Indicators preview */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                    <span>EMA 20 (Cyan) | Volume: Dynamique</span>
                    <span>H: {currentPairData.high24h} | L: {currentPairData.low24h}</span>
                  </div>
                </div>

                {/* Live Strategy & Auto-trading Log Output */}
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Flux d'Exécution & Journal de Stratégie</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Stratégie : {account.activeStrategy.toUpperCase()}
                    </span>
                  </div>

                  <div className="h-24 overflow-y-auto font-mono text-[11px] space-y-1 bg-black/40 p-2 rounded-lg border border-slate-800/60">
                    {autoLogs.length === 0 ? (
                      <div className="text-slate-500 italic">En attente d'ordres ou de signaux algorithmiques...</div>
                    ) : (
                      autoLogs.map((log, i) => (
                        <div
                          key={i}
                          className={`flex items-start space-x-2 ${
                            log.type === 'buy'
                              ? 'text-emerald-400'
                              : log.type === 'sell'
                              ? 'text-rose-400'
                              : log.type === 'tp'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                        >
                          <span className="text-slate-500 text-[10px]">[{log.time}]</span>
                          <span>{log.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Execution Desk (3 cols) */}
              <div className="lg:col-span-3 space-y-3">
                <div className="p-4 bg-slate-900/80 rounded-xl border border-cyan-900/40 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Passation d'Ordre
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      Exécution Marché
                    </span>
                  </div>

                  {/* Lot Size Selector */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Volume (Lots)</span>
                      <span className="text-[10px] text-slate-500 font-mono">1 Lot = 100k</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setOrderLotSize((prev) => Math.max(0.01, Number((prev - 0.05).toFixed(2))))}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="10.0"
                        value={orderLotSize}
                        onChange={(e) => setOrderLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-mono font-bold text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => setOrderLotSize((prev) => Math.min(10.0, Number((prev + 0.05).toFixed(2))))}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Lot Quick Presets */}
                    <div className="grid grid-cols-4 gap-1 mt-1.5">
                      {[0.01, 0.1, 0.5, 1.0].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setOrderLotSize(preset)}
                          className={`py-0.5 text-[10px] font-mono rounded border transition-colors ${
                            orderLotSize === preset
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset} lot
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SL / TP in Pips */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Stop Loss (pips)</span>
                      <input
                        type="number"
                        value={customSlPips}
                        onChange={(e) => setCustomSlPips(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-rose-900/50 rounded-lg px-2.5 py-1 font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Take Profit (pips)</span>
                      <input
                        type="number"
                        value={customTpPips}
                        onChange={(e) => setCustomTpPips(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-emerald-900/50 rounded-lg px-2.5 py-1 font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                        placeholder="40"
                      />
                    </div>
                  </div>

                  {/* Big Buy & Sell Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {/* SELL BUTTON */}
                    <button
                      onClick={() => placeOrder('SELL')}
                      className="p-3 bg-gradient-to-b from-rose-600/90 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex flex-col items-center justify-center border border-rose-400/40 group active:scale-95"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>SELL</span>
                      </span>
                      <span className="font-mono font-bold text-sm mt-0.5 group-hover:scale-105 transition-transform">
                        {currentPairData.bid}
                      </span>
                    </button>

                    {/* BUY BUTTON */}
                    <button
                      onClick={() => placeOrder('BUY')}
                      className="p-3 bg-gradient-to-b from-emerald-600/90 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex flex-col items-center justify-center border border-emerald-400/40 group active:scale-95"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>BUY</span>
                      </span>
                      <span className="font-mono font-bold text-sm mt-0.5 group-hover:scale-105 transition-transform">
                        {currentPairData.ask}
                      </span>
                    </button>
                  </div>

                  {/* Quick AI Trigger Helper */}
                  <button
                    onClick={runAiAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-2 px-3 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? 'Calcul Quantitatif...' : `Scanner IA sur ${selectedPair}`}</span>
                  </button>
                </div>

                {/* Active Strategy Card */}
                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Profil de Stratégie</span>
                    <select
                      value={account.activeStrategy}
                      onChange={(e) => setAccount((prev) => ({ ...prev, activeStrategy: e.target.value as any }))}
                      className="bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none"
                    >
                      <option value="scalping">Scalping Haute Fréquence</option>
                      <option value="trend_following">Suivi de Tendance (EMA)</option>
                      <option value="breakout">Cassure Volatilité (Breakout)</option>
                      <option value="smc">Smart Money / Order Blocks</option>
                      <option value="arbitrage">Arbitrage Quantitatif</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Risque max / trade</span>
                    <span className="font-mono font-semibold text-amber-300">{account.riskPerTradePercent}%</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* POSITIONS TAB */}
          {activeTab === 'positions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Positions en Cours ({positions.length})
                </h3>
                {positions.length > 0 && (
                  <button
                    onClick={closeAllPositions}
                    className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Clôturer toutes les positions
                  </button>
                )}
              </div>

              {positions.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-slate-400">
                  <Layers className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Aucune position active pour le moment.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Placez un ordre BUY/SELL ou activez le Trading Autonome JARVIS pour lancer une exécution automatique.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Actif</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Lots</th>
                        <th className="p-3">Prix d'Entrée</th>
                        <th className="p-3">Prix Actuel</th>
                        <th className="p-3">SL</th>
                        <th className="p-3">TP</th>
                        <th className="p-3">P&L ($)</th>
                        <th className="p-3">Pips</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {positions.map((pos) => {
                        const isProfit = pos.floatingPnl >= 0;
                        return (
                          <tr key={pos.id} className="hover:bg-slate-900/40">
                            <td className="p-3 font-bold text-white flex items-center space-x-1.5">
                              <span>{pos.pair}</span>
                              {pos.isAutoTrade && (
                                <span className="px-1 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded text-[9px]">BOT</span>
                              )}
                            </td>
                            <td className="p-3 font-bold">
                              <span className={pos.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                                {pos.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{pos.lotSize}</td>
                            <td className="p-3 text-slate-400">{pos.openPrice}</td>
                            <td className="p-3 text-slate-200">{pos.currentPrice}</td>
                            <td className="p-3 text-rose-400/80">{pos.stopLoss || '-'}</td>
                            <td className="p-3 text-emerald-400/80">{pos.takeProfit || '-'}</td>
                            <td className={`p-3 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfit ? '+' : ''}${pos.floatingPnl}
                            </td>
                            <td className={`p-3 font-bold ${pos.floatingPips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {pos.floatingPips >= 0 ? '+' : ''}{pos.floatingPips} p
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => closePosition(pos.id, 'MANUAL')}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500 rounded text-[10px] font-sans transition-colors"
                              >
                                Fermer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TRADE HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Historique des Transactions ({tradeHistory.length})
                </h3>
                {tradeHistory.length > 0 && (
                  <button
                    onClick={() => setTradeHistory([])}
                    className="text-xs text-slate-400 hover:text-rose-400 underline"
                  >
                    Effacer l'historique
                  </button>
                )}
              </div>

              {tradeHistory.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-slate-400">
                  <BarChart2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Aucun historique de trade enregistré pour le moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Actif</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Lots</th>
                        <th className="p-3">Entrée</th>
                        <th className="p-3">Sortie</th>
                        <th className="p-3">Profit / Perte</th>
                        <th className="p-3">Pips</th>
                        <th className="p-3">Motif</th>
                        <th className="p-3 text-right">Heure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {tradeHistory.map((item) => {
                        const isWin = item.realizedPnl >= 0;
                        return (
                          <tr key={item.id} className="hover:bg-slate-900/40">
                            <td className="p-3 font-bold text-white">{item.pair}</td>
                            <td className="p-3 font-bold">
                              <span className={item.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                                {item.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{item.lotSize}</td>
                            <td className="p-3 text-slate-400">{item.openPrice}</td>
                            <td className="p-3 text-slate-200">{item.closePrice}</td>
                            <td className={`p-3 font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isWin ? '+' : ''}${item.realizedPnl}
                            </td>
                            <td className={`p-3 font-bold ${item.realizedPips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {item.realizedPips >= 0 ? '+' : ''}{item.realizedPips} p
                            </td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                                {item.closeReason}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-500">{item.closeTime}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUANTITATIVE AI SCANNER TAB */}
          {activeTab === 'ai_analysis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Cortex Quantitatif & Détection de Signaux</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modélisation institutionnelle des déséquilibres de liquidité et calcul de ratio risque/rendement
                  </p>
                </div>

                <button
                  onClick={runAiAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs flex items-center space-x-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyse en cours...' : `Scanner ${selectedPair}`}</span>
                </button>
              </div>

              {aiSignal ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Signal Card */}
                  <div className="p-4 bg-slate-900/70 rounded-xl border border-cyan-500/30 space-y-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Signal Recommandé</span>
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-mono font-extrabold px-3 py-1 rounded-lg ${
                        aiSignal.action.includes('BUY') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        aiSignal.action.includes('SELL') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {aiSignal.action}
                      </span>
                      <span className="text-xs font-mono text-cyan-400">
                        Confiance: {Math.round(aiSignal.confidence * 100)}%
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-mono pt-2 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Prix d'Entrée :</span>
                        <span className="text-white font-bold">{aiSignal.entryPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-400">Stop Loss :</span>
                        <span className="text-rose-400 font-bold">{aiSignal.stopLoss}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400">Take Profit :</span>
                        <span className="text-emerald-400 font-bold">{aiSignal.takeProfit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400">Ratio R:R :</span>
                        <span className="text-amber-300 font-bold">{aiSignal.riskRewardRatio}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const type = aiSignal.action.includes('SELL') ? 'SELL' : 'BUY';
                        placeOrder(type);
                      }}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Exécuter l'Ordre Immédiatement
                    </button>
                  </div>

                  {/* Quantitative Reasoning Card */}
                  <div className="md:col-span-2 p-4 bg-slate-900/70 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Explication Algorithmique</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {aiSignal.reasoning}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                      <div className="p-2 rounded bg-black/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">RSI (14)</span>
                        <span className="font-mono text-xs font-bold text-cyan-300">{aiSignal.indicators.rsi}</span>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">MACD</span>
                        <span className="font-mono text-xs font-bold text-slate-200">{aiSignal.indicators.macd}</span>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Tendance</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">{aiSignal.indicators.trend}</span>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Volatilité</span>
                        <span className="font-mono text-xs font-bold text-amber-300">{aiSignal.indicators.volatility}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20 text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-cyan-400 animate-pulse" />
                  <p className="text-xs">Cliquez sur "Scanner {selectedPair}" pour générer les signaux prédictifs.</p>
                </div>
              )}
            </div>
          )}

          {/* BROKER CONNECTIVITY TAB */}
          {activeTab === 'broker' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Environnement Broker & Passerelle d'Exécution</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Mode d'Exécution</label>
                    <select
                      value={account.brokerMode}
                      onChange={(e) => setAccount((prev) => ({ ...prev, brokerMode: e.target.value as any }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="simulation">Simulation Haute Précision (Paper Trading Stark)</option>
                      <option value="metatrader5">Pont MetaTrader 5 (MT5 Bridge Webhook)</option>
                      <option value="oanda">OANDA REST v20 API</option>
                      <option value="binance">Binance Futures / Forex USD-M</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Clé API Broker / Token d'Accès</label>
                    <input
                      type="password"
                      value={account.brokerApiKey || ''}
                      onChange={(e) => setAccount((prev) => ({ ...prev, brokerApiKey: e.target.value }))}
                      placeholder="sk-broker-xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">URL de Webhook Externe (MetaTrader / Discord / Telegram)</label>
                    <input
                      type="text"
                      value={account.brokerWebhookUrl || ''}
                      onChange={(e) => setAccount((prev) => ({ ...prev, brokerWebhookUrl: e.target.value }))}
                      placeholder="https://votre-serveur-mt5.com/api/orders"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setAccount((prev) => ({ ...prev, balance: 10000.0, equity: 10000.0 }));
                        if (onSpeak) onSpeak("Le capital virtuel du compte a été réinitialisé à dix mille dollars.");
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      Réinitialiser Capital ($10,000)
                    </button>

                    <button
                      onClick={() => {
                        if (onSpeak) onSpeak("Paramètres du broker enregistrés.");
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Enregistrer la Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 border-t border-cyan-900/40 bg-slate-950/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-300">Flux Forex Connecté</span>
            </span>
            <span className="hidden sm:inline font-mono text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              Commande vocale : <span className="text-cyan-400 font-mono">"J.A.R.V.I.S., trade EUR/USD"</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (onExecutePrompt) {
                  onExecutePrompt(`Exécute une analyse de trading approfondie sur le Forex pour ${selectedPair} avec recommandations SL/TP`);
                  onClose();
                }
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-xs"
            >
              Envoyer la mission au chat JARVIS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
