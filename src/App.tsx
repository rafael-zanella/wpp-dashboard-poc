import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, AppBar, Toolbar, Avatar, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { WhatsAppConnector } from './components/WhatsAppConnector';
import { TokenUsageMonitor } from './components/TokenUsageMonitor';

const drawerWidth = 250;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0c', // Matches --bg-primary
      paper: 'rgba(23, 25, 30, 0.4)', // Glass panel background
    },
    primary: {
      main: '#10b981', // WhatsApp/Success green
    },
    secondary: {
      main: '#8b5cf6', // Gemini Purple
    },
    text: {
      primary: '#f0f2f5',
      secondary: '#9499a1',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0a0a0c',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          backdropFilter: 'blur(12px)',
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar Layout */}
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
          variant="permanent"
          anchor="left"
        >
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>A</Typography>
            </Box>
            <Typography variant="h6" fontWeight="bold">Antigravity</Typography>
          </Box>

          <List sx={{ px: 2 }}>
            {[
              { id: 'dashboard', label: 'Overview', icon: <DashboardIcon /> },
              { id: 'messages', label: 'Messages', icon: <MessageIcon /> },
              { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
            ].map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: activeTab === item.id ? 600 : 400,
                      color: activeTab === item.id ? 'text.primary' : 'text.secondary'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <AppBar position="sticky" sx={{ pt: 2, pb: 1, px: 4 }}>
            <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" fontWeight="600" gutterBottom sx={{ m: 0 }}>Command Center</Typography>
                <Typography variant="body2" color="text.secondary">Manage your AI instances and WhatsApp connections</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton color="inherit" sx={{ color: 'text.secondary' }}>
                  <NotificationsIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#8b5cf6', fontSize: '0.9rem' }}>AU</Avatar>
                  <Typography variant="body2" fontWeight="500">Admin User</Typography>
                </Box>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Dashboard Container */}
          {activeTab === 'dashboard' && (
            <Box sx={{
              p: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 4
            }}>
              <WhatsAppConnector />
              <TokenUsageMonitor />
            </Box>
          )}
        </Box>

      </Box>
    </ThemeProvider>
  );
}

export default App;
