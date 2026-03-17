import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, QrCode, CheckCircle2 } from 'lucide-react';
import './WhatsAppConnector.css';

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
    <div className="glass-panel connector-card">
      <div className="card-header">
        <div className="card-title">
          <Smartphone className="icon-green" size={24} />
          <h3>Evolution API WhatsApp</h3>
        </div>
        <div className={`status-badge ${status}`}>
          {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </div>
      </div>

      <div className="card-body">
        {status === 'disconnected' && (
          <div className="qr-container placeholder">
            <QrCode size={120} className="qr-icon" />
            <p>Ready to connect instance</p>
            <button className="btn-primary" onClick={handleConnect}>
              Generate QR Code
            </button>
          </div>
        )}

        {status === 'connecting' && (
          <div className="qr-container loading">
            {qrCodeBase64 ? (
              <div className="real-qr-code">
                <img src={qrCodeBase64} alt="Evolution API WhatsApp QR Code" style={{ width: 200, height: 200, borderRadius: 12, border: '4px solid white', backgroundColor: 'white' }} />
              </div>
            ) : (
              <div className="mock-qr-code">
                <div className="qr-corner top-left"></div>
                <div className="qr-corner top-right"></div>
                <div className="qr-corner bottom-left"></div>
                <RefreshCw className="spinner" size={40} />
              </div>
            )}
            <p>{qrCodeBase64 ? 'Scan this code in WhatsApp' : 'Generating QR Code...'}</p>
          </div>
        )}

        {status === 'connected' && (
          <div className="success-state">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="profile-pic" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 16, border: '2px solid rgba(255,255,255,0.1)' }} />
            ) : (
              <CheckCircle2 size={64} className="success-icon icon-green" />
            )}
            <h4>{profileName || 'Instance Connected'}</h4>
            <p>Session: {instanceName}</p>
            <button className="btn-secondary" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
