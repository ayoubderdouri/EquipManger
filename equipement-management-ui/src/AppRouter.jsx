import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/Shared/NotFound";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import GuestLayout from "./layouts/GuestLayout";
import { Login, FirstActivation, ForgotPassword } from "./pages/Account";
import UsersPage from "./pages/Account/UsersPage";
import Dashboard from "./pages/Shared/Dashboard";
import EquipmentsPage from "./pages/Equipment/EquipmentsPage";
import EquipmentCreatePage from "./pages/Equipment/EquipmentCreatePage";
import RoomsPage from "./pages/Rooms/RoomsPage";
import InterventionsPage from "./pages/Interventions/InterventionsPage";

export default function AppRouter({ mode, onToggleMode }) {
  return (
    <Routes>
      <Route path="/" element={<GuestLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/first-activation" element={<FirstActivation />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/" element={<AuthenticatedLayout mode={mode} onToggleMode={onToggleMode} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="equipements" element={<EquipmentsPage />} />
        <Route path="equipements/nouveau" element={<EquipmentCreatePage />} />
        <Route path="equipements/:id/modifier" element={<EquipmentCreatePage />} />
        <Route path="dashboard/salles" element={<RoomsPage />} />
        <Route path="dashboard/interventions" element={<InterventionsPage />} />
        <Route path="dashboard/utilisateurs" element={<UsersPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
