import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Products", icon: <CategoryIcon />, path: "/products" },
  { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  { text: "Competitors", icon: <CompareArrowsIcon />, path: "/competitors" },
  { text: "Pricing Engine", icon: <AutoFixHighIcon />, path: "/pricing" },
];

const Sidebar = ({ mobileOpen, onDrawerToggle, window }) => {
  const location = useLocation();

  const drawerContent = (
    <div>
      <ToolbarSpace />
      <Box sx={{ overflow: "auto", mt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={mobileOpen ? onDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive ? "primary.light" : "transparent",
                    color: isActive ? "primary.main" : "text.secondary",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "primary.light"
                        : "action.hover",
                    },
                    ...(isActive && {
                      backgroundColor: "rgba(21, 101, 192, 0.08)",
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "primary.main" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.95rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 2, mx: 2 }} />
      </Box>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px solid #E5E7EB",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export const ToolbarSpace = () => <Box sx={{ minHeight: 64 }} />;

export default Sidebar;
