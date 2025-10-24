import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ✅ Reaktif: kalau token berubah di localStorage (misal logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Halaman Login */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* ✅ Halaman Dashboard & Checkout dilindungi */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* ✅ Payment Success tidak butuh proteksi */}
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* ✅ Default root diarahkan sekali, tanpa loop */}
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />

        {/* 404 Fallback */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
