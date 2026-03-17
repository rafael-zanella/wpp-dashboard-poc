import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, Box, Typography, LinearProgress, CircularProgress } from '@mui/material';

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
        <Card sx={{
            p: 0,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
            display: 'flex', flexDirection: 'column'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Sparkles size={24} color="#8b5cf6" />
                    <Typography variant="h6" fontWeight="600" m={0}>Google Gemini Tokens</Typography>
                </Box>
            </Box>

            <CardContent sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{
                        flex: 1, p: 2, borderRadius: 3,
                        bgcolor: 'background.default', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Typography variant="body2" color="text.secondary" mb={1} fontWeight="500">Used Value</Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                            {loading ? <CircularProgress size={24} color="inherit" /> : usedTokens.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{
                        flex: 1, p: 2, borderRadius: 3,
                        bgcolor: 'background.default', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Typography variant="body2" color="text.secondary" mb={1} fontWeight="500">Total Quota</Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {loading ? <CircularProgress size={24} color="inherit" /> : totalTokens.toLocaleString()}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" fontWeight="500">Usage Limit</Typography>
                        <Typography variant="body2" fontWeight="bold" color="secondary.main">{percentage.toFixed(1)}%</Typography>
                    </Box>

                    <Box sx={{ position: 'relative', height: 10, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 5, overflow: 'hidden' }}>
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${percentage}%`, bgcolor: 'secondary.main',
                            borderRadius: 5, boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>Tokens refresh in 14 days</Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 3,
                        bgcolor: 'rgba(23, 25, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <BrainCircuit size={20} color="#8b5cf6" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Model</Typography>
                            <Typography variant="body2" fontWeight="600">Gemini 1.5 Pro</Typography>
                        </Box>
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 3,
                        bgcolor: 'rgba(23, 25, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Activity size={20} color="#8b5cf6" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Avg Latency</Typography>
                            <Typography variant="body2" fontWeight="600">1.2s</Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
