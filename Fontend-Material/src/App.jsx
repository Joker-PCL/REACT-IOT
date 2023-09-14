import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, NavMini } from "@/layouts";
import { MachineDetail } from "@/pages/subpages";

function App() {
  return (
    <Routes>
      <Route path="/home/*" element={<Dashboard />} />
      <Route path="/auth/*" element={<NavMini />} />
      <Route path="*" element={<Navigate to="/home/dashboard" replace />} />
      <Route path="/machine-detail/*" element={<MachineDetail />} />
    </Routes>
  );
}

export default App;
