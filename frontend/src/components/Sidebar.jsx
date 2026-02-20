import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Typography,
  Box,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarehouseIcon from "@mui/icons-material/Warehouse";

const drawerWidth = 240;

const Sidebar = () => {
  const menuItems = [
    { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { text: "Orders", path: "/orders", icon: <ReceiptLongIcon /> },
    { text: "Warehouses", path: "/warehouses", icon: <WarehouseIcon /> },
  ];

  const { mode, toggleTheme } = useContext(ThemeContext);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Admin Panel
        </Typography>
      </Toolbar>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ flexGrow: 1 }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  "&.active": {
                    backgroundColor: "action.selected",
                    borderLeft: "4px solid",
                    borderColor: "primary.main",
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                    "& .MuiListItemText-primary": {
                      fontWeight: 600,
                    },
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ ml: 2 }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={<Switch checked={mode === "dark"} onChange={toggleTheme} />}
          label="Dark Mode"
        />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
