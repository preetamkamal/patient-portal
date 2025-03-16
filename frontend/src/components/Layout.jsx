// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  useMediaQuery,
  Button,
  Divider,
  Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('patientId');
    navigate('/');
  };

  // Add background color and bold text if active
  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '8px',
    borderRadius: '4px',
    color: isActive ? theme.palette.primary.main : '#333',
    fontWeight: isActive ? 'bold' : 'normal',
    backgroundColor: isActive ? 'rgba(0,0,0,0.1)' : 'transparent',
  });

  const drawerContent = (
    <Box sx={{ width: drawerWidth, p: 2 }}>
      <Typography
        variant="h5"
        sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main }}
        className="oxygen-bold"
      >
        Healer
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {role === 'admin' ? (
        <List>
          <ListItem>
            <NavLink to="/admin" style={linkStyle} end>
              <ListItemText primary="Admin Dashboard" />
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/admin/manage-questions" style={linkStyle}>
              <ListItemText primary="Manage Questions" />
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/admin/toggle-edit" style={linkStyle}>
              <ListItemText primary="Toggle Edit" />
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/admin/responses" style={linkStyle}>
              <ListItemText primary="View Responses" />
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/admin/delete-users" style={linkStyle}>
              <ListItemText primary="Delete Users" />
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/admin/logs" style={linkStyle}>
              <ListItemText primary="View Logs" />
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/admin/add-question" style={linkStyle}>
              <ListItemText primary="Add Question" />
            </NavLink>
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem>
            <NavLink to="/patient" style={linkStyle} end>
              <ListItemText primary="Patient MCQ" />
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/patient/my-responses" style={linkStyle}>
              <ListItemText primary="View My Responses" />
            </NavLink>
          </ListItem>
        </List>
      )}
      <Divider sx={{ my: 2 }} />
      <Stack alignItems="center">
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box className="oxygen-regular" sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: theme.palette.primary.main,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }} className="oxygen-bold">
            {role === 'admin' ? 'Admin Panel' : 'Patient Portal'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: !isMobile && drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
