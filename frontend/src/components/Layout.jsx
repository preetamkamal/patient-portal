import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  CssBaseline,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const role = localStorage.getItem('role'); // 'admin' or 'patient'

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  // Drawer content (links differ for admin vs. patient)
  const drawerContent = (
    <Box sx={{ width: drawerWidth, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Healer
      </Typography>
      {role === 'admin' ? (
        <List>
          <ListItem button component={Link} to="/admin">
            <ListItemText primary="Admin Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/admin/toggle-edit">
            <ListItemText primary="Toggle Edit" />
          </ListItem>
          <ListItem button component={Link} to="/admin/add-question">
            <ListItemText primary="Add Question" />
          </ListItem>
          <ListItem button component={Link} to="/admin/logs">
            <ListItemText primary="View Logs" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button component={Link} to="/patient">
            <ListItemText primary="Patient MCQ" />
          </ListItem>
        </List>
      )}

      <Box sx={{ mt: 2 }}>
        <button onClick={handleLogout}>Logout</button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar with a higher zIndex than the drawer */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure it's above the drawer
          bgcolor: 'primary.main', // Teal (from MUI theme or your custom theme)
        }}
      >
        <Toolbar>
          {/* Hamburger menu (only on mobile) */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {role === 'admin' ? 'Admin Panel' : 'Patient Portal'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer: persistent on desktop, temporary on mobile */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content: add top margin to avoid overlapping the AppBar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // Offset the AppBar height:
          mt: '64px', // Typical MUI AppBar height on desktop
          // Push content right if drawer is open (desktop)
          ml: !isMobile && drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* The <Toolbar /> component can also be used instead of mt if you prefer:
            <Toolbar />
         */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
