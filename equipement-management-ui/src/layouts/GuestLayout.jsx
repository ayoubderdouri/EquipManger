import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

function GuestLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "stretch",
        background:
          "linear-gradient(135deg, rgba(0,69,147,0.96) 0%, rgba(0,51,111,0.96) 48%, rgba(15,159,143,0.84) 100%)",
      }}
    >
      <Outlet />
    </Box>
  );
}

export default GuestLayout;
