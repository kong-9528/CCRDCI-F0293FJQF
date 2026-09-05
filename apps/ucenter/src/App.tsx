import { Navigate, Route, Routes } from "react-router-dom";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { RebindPhonePage } from "@/pages/RebindPhonePage";
import { SecurityHomePage } from "@/pages/SecurityHomePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/security" element={<SecurityHomePage />} />
      <Route path="/security/password" element={<ChangePasswordPage />} />
      <Route path="/security/phone" element={<RebindPhonePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
