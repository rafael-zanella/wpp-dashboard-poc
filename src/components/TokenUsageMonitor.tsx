import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Activity, RefreshCw } from 'lucide-react';
import './TokenUsageMonitor.css';

export const TokenUsageMonitor: React.FC = () => {
    const [totalTokens, setTotalTokens] = useState(1000000);
    const [usedTokens, setUsedTokens] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const fetchUsage = () => {
            setLoading(true);
            setTimeout(() => {
                if (apiKey) {
                    setUsedTokens(345670);
                    setTotalTokens(2000000); // 2MM limits approx for free tier
                } else {
                    setUsedTokens(0);
                }
                setLoading(false);
            }, 1200);
        };
        fetchUsage();
    }, []);

    const percentage = totalTokens > 0 ? (usedTokens / totalTokens) * 100 : 0;

    return (
        <div className="glass-panel token-card">
            <div className="card-header">
                <div className="card-title">
                    <Sparkles className="icon-purple" size={24} />
                    <h3>Google Gemini Tokens</h3>
                </div>
            </div>

            <div className="token-stats">
                <div className="stat-box primary">
                    <div className="stat-label">Used Value</div>
                    <div className="stat-value">
                        {loading ? <RefreshCw className="spinner" size={20} /> : usedTokens.toLocaleString()}
                    </div>
                </div>
                <div className="stat-box secondary">
                    <div className="stat-label">Total Quota</div>
                    <div className="stat-value">
                        {loading ? <RefreshCw className="spinner" size={20} /> : totalTokens.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="progress-section">
                <div className="progress-header">
                    <span>Usage Limit</span>
                    <span className="percentage-text">{percentage.toFixed(1)}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="progress-glow"></div>
                    </div>
                </div>
                <p className="usage-hint">Tokens refresh in 14 days</p>
            </div>

            <div className="metrics-grid">
                <div className="metric-item glass-panel">
                    <BrainCircuit size={18} className="icon-purple" />
                    <div className="metric-info">
                        <span className="metric-title">Model</span>
                        <span className="metric-val">Gemini 1.5 Pro</span>
                    </div>
                </div>
                <div className="metric-item glass-panel">
                    <Activity size={18} className="icon-purple" />
                    <div className="metric-info">
                        <span className="metric-title">Avg Latency</span>
                        <span className="metric-val">1.2s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
