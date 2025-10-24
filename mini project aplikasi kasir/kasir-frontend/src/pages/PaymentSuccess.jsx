// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api"; // pastikan ini adalah instance axios kamu
import { API_BASE_URL } from "../config";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionId = location.state?.transactionId;

  const [transaction, setTransaction] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Formatter Rupiah
  const formatRupiah = (value) => {
    if (!value || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  // 🔹 Redirect jika tidak ada transactionId
  useEffect(() => {
    if (!transactionId) {
      navigate("/dashboard", { replace: true });
    }
  }, [transactionId, navigate]);

  // 🔹 Ambil detail transaksi dari API
  useEffect(() => {
    let mounted = true;

    const fetchTransactionDetail = async () => {
      if (!transactionId) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/transactions/${transactionId}`);

        if (!mounted) return;

        if (res.data?.success) {
          const trx = res.data.data.transaction;
          const itemsData = res.data.data.items || [];

          // Pastikan semua angka valid
          trx.total = Number(trx.total) || 0;
          const sanitizedItems = itemsData.map((it) => ({
            ...it,
            subtotal: Number(it.subtotal) || 0,
            quantity: Number(it.quantity) || 0,
          }));

          setTransaction(trx);
          setItems(sanitizedItems);
        } else {
          setErrorMsg(res.data?.message || "Gagal mengambil data transaksi.");
        }
      } catch (err) {
        console.error("Gagal mengambil detail transaksi:", err);
        const serverMsg = err.response?.data?.message || err.message;
        setErrorMsg(serverMsg);

        // Jika token invalid, arahkan ke login
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTransactionDetail();
    return () => {
      mounted = false;
    };
  }, [transactionId, navigate]);

  // 🔹 State loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Memuat detail transaksi...
      </div>
    );
  }

  // 🔹 Jika error
  if (errorMsg) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
          <p className="text-red-600 font-semibold mb-3">
            Terjadi kesalahan: {errorMsg}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Jika data tidak ditemukan
  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Transaksi tidak ditemukan.
      </div>
    );
  }

  // 🔹 Tampilan sukses
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-lg text-gray-800">
        <h2 className="text-3xl font-bold mb-4 text-center text-green-600">
          Pembayaran Berhasil 🎉
        </h2>

        <div className="space-y-2 border-b pb-4">
          <p>
            <strong>ID Transaksi:</strong> {transaction.id}
          </p>
          <p>
            <strong>Tanggal:</strong>{" "}
            {new Date(transaction.created_at).toLocaleString("id-ID")}
          </p>
          <p>
            <strong>Total:</strong> {formatRupiah(transaction.total)}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2 text-lg">Items:</h3>
          <ul className="divide-y divide-gray-200">
            {items.map((it, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>
                  {it.name} — {it.quantity}x
                </span>
                <span>{formatRupiah(it.subtotal)}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
          ← Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
