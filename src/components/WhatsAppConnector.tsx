import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, QrCode, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Box, Typography, Button } from '@mui/material';

export const WhatsAppConnector: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

  // State for profile data
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  const instanceName = "Quantum";

  // Function to fetch profile data
  const fetchProfileData = async () => {
    const serverUrl = import.meta.env.VITE_EVOLUTION_SERVER_URL;
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;

    try {
      const res = await fetch(`${serverUrl}/instance/fetchInstances?instanceName=${instanceName}`, {
        headers: { 'apikey': apiKey }
      });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const instanceData = data[0];
        if (instanceData.profileName) setProfileName(instanceData.profileName);
        if (instanceData.profilePicUrl) setProfilePicUrl(instanceData.profilePicUrl);
      }
    } catch (e) {
      console.error("Could not fetch profile data", e);
    }
  };


  const handleConnect = async () => {
    setStatus('connecting');
    setQrCodeBase64(null);

    const serverUrl = import.meta.env.VITE_EVOLUTION_SERVER_URL;
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;

    if (!serverUrl || !apiKey) {
      console.error("Evolution variables missing in .env");
      setStatus('disconnected');
      return;
    }

    try {

      // Generate / Fetch QR Code
      const qrRes = await fetch(`${serverUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': apiKey
        }
      });

      const qrData = await qrRes.json();

      if (qrData.base64) {
        setQrCodeBase64(qrData.base64);
        setStatus('connecting'); // wait for user to scan
      } else if (qrData.instance?.state === 'open') {
        setStatus('connected');
        fetchProfileData();
      }

    } catch (error) {
      console.error("Error connecting to Evolution API:", error);
      setStatus('disconnected');
    }
  };

  // Poll for connection state when QR is displayed
  useEffect(() => {
    let stateIntervalId: ReturnType<typeof setInterval>;
    let qrRefreshIntervalId: ReturnType<typeof setInterval>;

    if (status === 'connecting') {
      const serverUrl = import.meta.env.VITE_EVOLUTION_SERVER_URL;
      const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;

      const checkState = async () => {
        try {
          const res = await fetch(`${serverUrl}/instance/fetchInstances?instanceName=${instanceName}`, {
            headers: { 'apikey': apiKey }
          });
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            const instanceData = data[0];
            // Once the user scans, the state changes to 'open'
            if (instanceData.connectionStatus === 'open') {
              setStatus('connected');
              setQrCodeBase64(null); // Clear QR code memory

              if (instanceData.profileName) setProfileName(instanceData.profileName);
              if (instanceData.profilePicUrl) setProfilePicUrl(instanceData.profilePicUrl);
            }
          }
        } catch (e) { /* ignore polling errors */ }
      };

      const refreshQr = async () => {
        try {
          const qrRes = await fetch(`${serverUrl}/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: { 'apikey': apiKey }
          });
          const qrData = await qrRes.json();
          if (qrData.base64) {
            setQrCodeBase64(qrData.base64);
          }
        } catch (e) { /* ignore errors */ }
      };

      stateIntervalId = setInterval(checkState, 3000);
      qrRefreshIntervalId = setInterval(refreshQr, 50000);
    }

    return () => {
      if (stateIntervalId) clearInterval(stateIntervalId);
      if (qrRefreshIntervalId) clearInterval(qrRefreshIntervalId);
    };
  }, [status, instanceName]);

  // Initial check on mount
  useEffect(() => {
    const checkInitialState = async () => {
      const serverUrl = import.meta.env.VITE_EVOLUTION_SERVER_URL;
      const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
      if (!serverUrl || !apiKey) return;

      try {
        const res = await fetch(`${serverUrl}/instance/fetchInstances?instanceName=${instanceName}`, {
          headers: { 'apikey': apiKey }
        });
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const instanceData = data[0];
          if (instanceData.connectionStatus === 'open') {
            setStatus('connected');
            if (instanceData.profileName) setProfileName(instanceData.profileName);
            if (instanceData.profilePicUrl) setProfilePicUrl(instanceData.profilePicUrl);
          }
        }
      } catch (e) {
        console.log("No instance found or not connected initially");
      }
    };
    checkInitialState();
  }, []);

  const handleDisconnect = async () => {
    const serverUrl = import.meta.env.VITE_EVOLUTION_SERVER_URL;
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;

    if (!serverUrl || !apiKey) return;

    try {
      // Disconnect the instance in the backend
      const res = await fetch(`${serverUrl}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey
        }
      });
      const data = await res.json();

      if (data?.status === 'SUCCESS' || data?.response?.message === 'Instance logged out') {
        console.log('Successfully logged out from Evolution API instance');
      } else {
        console.warn('Logout returned non-success response:', data);
      }

      // Clear frontend state whether it succeeded gracefully or not
      setStatus('disconnected');
      setProfileName(null);
      setProfilePicUrl(null);
      setQrCodeBase64(null);
    } catch (e) {
      console.error("Failed to disconnect", e);
      // Still revert state locally so user isn't stuck
      setStatus('disconnected');
      setProfileName(null);
      setProfilePicUrl(null);
      setQrCodeBase64(null);
    }
  };

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
          <Smartphone size={24} color="#10b981" />
          <Typography variant="h6" fontWeight="600" m={0}>Evolution API WhatsApp</Typography>
        </Box>
        <Box sx={{
          px: 1.5, py: 0.5, borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
          bgcolor: status === 'connected' ? 'rgba(16, 185, 129, 0.15)' : status === 'connecting' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.1)',
          color: status === 'connected' ? '#10b981' : status === 'connecting' ? '#f59e0b' : 'text.secondary'
        }}>
          {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        {status === 'disconnected' && (
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 3, borderRadius: '50%', bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
              <QrCode size={64} color="var(--text-secondary)" />
            </Box>
            <Typography color="text.secondary">Ready to connect instance</Typography>
            <Button variant="contained" color="primary" onClick={handleConnect} sx={{ mt: 2, borderRadius: 2, textTransform: 'none', px: 4, py: 1.5 }}>
              Generate QR Code
            </Button>
          </Box>
        )}

        {status === 'connecting' && (
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {qrCodeBase64 ? (
              <Box>
                <img src={qrCodeBase64} alt="WhatsApp QR Code" style={{ width: 220, height: 220, borderRadius: 12, border: '4px solid white', backgroundColor: 'white', padding: 8 }} />
              </Box>
            ) : (
              <Box sx={{
                width: 200, height: 200, border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <RefreshCw size={40} className="spinner" color="var(--text-secondary)" />
              </Box>
            )}
            <Typography color="text.secondary">
              {qrCodeBase64 ? 'Scan this code in WhatsApp' : 'Generating QR Code...'}
            </Typography>
          </Box>
        )}

        {status === 'connected' && (
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), transparent)'
            }}>
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
              ) : (
                <CheckCircle2 size={48} color="#10b981" />
              )}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="600">{profileName || 'Instance Connected'}</Typography>
              <Typography color="text.secondary" variant="body2">Session: {instanceName}</Typography>
            </Box>
            <Button variant="outlined" color="inherit" onClick={handleDisconnect} sx={{ mt: 2, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.2)' }}>
              Disconnect
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
