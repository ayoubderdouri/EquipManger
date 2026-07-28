import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function AuthenticatedLayout({ mode, onToggleMode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          mode === "light"
            ? "linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%)"
            : "linear-gradient(180deg, #0b1220 0%, #111827 100%)",
        transition: "background 0.4s ease",
      }}
    >
      <Navbar mode={mode} onToggleMode={onToggleMode} />

      <Box
        component="main"
        sx={{
          pt: { xs: 2, sm: 3 },
          pb: { xs: 4, sm: 6 },
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
