import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  useTheme,
  Divider,
  ListItemIcon,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Container,
  Chip,
} from "@mui/material";
import {
  AccountCircle,
  BuildCircleOutlined,
  CloseOutlined,
  DarkModeOutlined,
  DashboardOutlined,
  Inventory2Outlined,
  LightModeOutlined,
  LogoutOutlined,
  MeetingRoomOutlined,
  MenuOutlined,
  PrecisionManufacturingOutlined,
  SupervisedUserCircleOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

export const NAV_LINKS = [
  {
    label: "Tableau de bord",
    path: "/dashboard",
    icon: <DashboardOutlined fontSize="small" />,
  },
  {
    label: "Equipements",
    path: "/equipements",
    icon: <Inventory2Outlined fontSize="small" />,
  },
  {
    label: "Salles",
    path: "/dashboard/salles",
    icon: <MeetingRoomOutlined fontSize="small" />,
  },
  {
    label: "Interventions",
    path: "/dashboard/interventions",
    icon: <BuildCircleOutlined fontSize="small" />,
  },
  {
    label: "Utilisateurs",
    path: "/dashboard/utilisateurs",
    icon: <SupervisedUserCircleOutlined fontSize="small" />,
  },
];

export default function Navbar({ mode, onToggleMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logout } = useAuth();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState({ username: "Administrateur", email: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isLight = mode === "light";
  const navBg = isLight ? "rgba(255,255,255,0.92)" : "rgba(17,24,39,0.92)";
  const isAdmin = user?.role === "ADMIN";

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.path === "/dashboard/utilisateurs") {
      return isAdmin;
    }
    return true;
  });

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Confirmer la deconnexion",
      text: "Voulez-vous vraiment fermer votre session ?",
      showCancelButton: true,
      confirmButtonText: "Se deconnecter",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      await logout();
    }
  };

  const renderNavItem = (link) => {
    const active =
      location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);

    return (
      <Button
        key={link.path}
        startIcon={link.icon}
        onClick={() => navigate(link.path)}
        sx={{
          borderRadius: "8px",
          px: 1.5,
          py: 0.8,
          fontSize: "0.86rem",
          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          background: active ? `${theme.palette.primary.main}14` : "transparent",
          fontWeight: active ? 700 : 500,
          whiteSpace: "nowrap",
          "&:hover": {
            background: `${theme.palette.primary.main}12`,
            color: theme.palette.primary.main,
          },
        }}
      >
        {link.label}
      </Button>
    );
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: navBg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              px: "0 !important",
              minHeight: "64px !important",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                cursor: "pointer",
                minWidth: 0,
              }}
              onClick={() => navigate("/")}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "8px",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(0,69,147,0.28)",
                  flexShrink: 0,
                }}
              >
                <PrecisionManufacturingOutlined sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    lineHeight: 1.15,
                    whiteSpace: "nowrap",
                  }}
                >
                  EquipManager
                </Typography>
                {!isMobile && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Equipements, salles et interventions techniques
                  </Typography>
                )}
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 2 }}>
                {visibleLinks.map(renderNavItem)}
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

          

            <Tooltip title={isLight ? "Mode sombre" : "Mode clair"}>
              <IconButton
                onClick={onToggleMode}
                sx={{
                  borderRadius: "8px",
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    background: `${theme.palette.primary.main}12`,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {isLight ? <DarkModeOutlined /> : <LightModeOutlined />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Profil utilisateur">
              <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: theme.palette.primary.main,
                    boxShadow: "0 2px 8px rgba(0,69,147,0.32)",
                  }}
                >
                  <AccountCircle fontSize="small" />
                </Avatar>
              </IconButton>
            </Tooltip>

            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ borderRadius: "8px", color: theme.palette.text.secondary }}
              >
                <MenuOutlined />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: "8px",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {user.username || "Administrateur"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email || "Session active"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem sx={{ gap: 1.5 }}>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          Parametres
        </MenuItem>
        <MenuItem
          onClick={async () => {
            setUserMenuAnchor(null);
            await handleLogout();
          }}
          sx={{ gap: 1.5, color: "error.main" }}
        >
          <ListItemIcon>
            <LogoutOutlined fontSize="small" color="error" />
          </ListItemIcon>
          Deconnexion
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: theme.palette.background.paper,
            p: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="primary">
            EquipManager
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {visibleLinks.map((link) => {
            const active = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
            return (
              <ListItemButton
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setDrawerOpen(false);
                }}
                selected={active}
                sx={{
                  borderRadius: "8px",
                  mb: 0.5,
                  "&.Mui-selected": {
                    background: `${theme.palette.primary.main}14`,
                    color: theme.palette.primary.main,
                    "& .MuiListItemIcon-root": {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
