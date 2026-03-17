import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Settings, Bell } from 'lucide-react';
import { WhatsAppConnector } from './components/WhatsAppConnector';
import { TokenUsageMonitor } from './components/TokenUsageMonitor';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <span style={{ color: "white", fontWeight: "bold" }}>A</span>
          </div>
          <h1>Antigravity</h1>
        </div>

        <nav className="nav-menu">
          <a
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </a>
          <a
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={20} />
            <span>Messages</span>
          </a>
          <a
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="page-title">
            <h2>Command Center</h2>
            <p>Manage your AI instances and WhatsApp connections</p>
          </div>

          <div className="header-actions">
            <div className="user-profile">
              <Bell size={18} color="var(--text-secondary)" />
              <div className="avatar"></div>
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Admin User</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid View */}
        {activeTab === 'dashboard' && (
          <div className="grid-dashboard fade-in">
            <WhatsAppConnector />
            <TokenUsageMonitor />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
