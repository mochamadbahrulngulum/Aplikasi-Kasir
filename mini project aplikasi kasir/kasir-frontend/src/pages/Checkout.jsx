import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useState } from "react";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(location.state?.cart || []);

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalBill = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    try {
      // Kirim data checkout ke backend
      const response = await axios.post(`${API_BASE_URL}/api/checkout`, {
        cart,
        total: totalBill,
      });

      // Jika stok tidak cukup → backend kirim status gagal
      if (response.data?.status === "error") {
        alert(response.data.message || "Stok tidak mencukupi!");
        return;
      }

      // Jika sukses → arahkan ke halaman payment success
      navigate("/payment-success", { state: { total: totalBill } });
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Terjadi kesalahan saat melakukan pembayaran!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col">
      {/* Header */}
      <header className="bg-[#264de4] text-white flex justify-between items-center px-10 py-4 shadow">
        <h1 className="text-lg font-bold tracking-wide">MASPOS</h1>

        <div className="flex items-center gap-3">
          <button className="bg-white text-[#264de4] font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition">
            + Tambah Kategori
          </button>
          <button className="bg-white text-[#264de4] font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition">
            + Tambah Produk
          </button>

          <div className="bg-[#1d3cbf] text-white font-semibold px-5 py-2 rounded-lg">
            Total Tagihan Rp. {totalBill.toLocaleString()}
          </div>

          <div className="flex items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="User"
              className="w-8 h-8 rounded-full bg-white p-0.5"
            />
            <span className="text-sm font-medium">Aksen</span>
          </div>
        </div>
      </header>

      {/* Table Header */}
      <div className="grid grid-cols-12 px-12 py-4 font-semibold border-b text-gray-700 bg-white mt-6 rounded-t-xl shadow-sm">
        <div className="col-span-6">Product</div>
        <div className="col-span-3 text-center">Qty</div>
        <div className="col-span-3 text-right">Sub Total</div>
      </div>

      {/* Cart Items */}
      <div className="px-12 bg-white shadow-sm rounded-b-xl">
        {cart.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center py-6 border-b last:border-none"
          >
            <div className="col-span-6 flex items-center gap-4">
              <span className="w-6 text-gray-500">{index + 1}.</span>
              <img
                src={`http://localhost:3000/uploads/${item.image}`}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
              />
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-gray-500 text-sm">
                  Rp. {Number(item.price).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="col-span-3 flex justify-center items-center gap-3">
              <button
                onClick={() => decreaseQty(item.id)}
                className="bg-[#264de4] text-white w-8 h-8 flex justify-center items-center rounded-full hover:bg-blue-700"
              >
                <Minus size={14} />
              </button>
              <span className="text-base font-semibold text-gray-700 w-6 text-center">
                {item.qty}
              </span>
              <button
                onClick={() => increaseQty(item.id)}
                className="bg-[#264de4] text-white w-8 h-8 flex justify-center items-center rounded-full hover:bg-blue-700"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="col-span-3 flex justify-between items-center text-right">
              <span className="text-gray-800 font-medium w-full text-right">
                Rp. {(item.price * item.qty).toLocaleString()}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-6 bg-[#d64541] hover:bg-[#b93733] text-white text-xs px-4 py-1.5 rounded transition font-medium"
              >
                Remove Item
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-12 py-6 flex justify-between items-center font-semibold text-gray-800 bg-white border-t shadow-sm mt-auto">
        <span>Total</span>
        <span>Rp. {totalBill.toLocaleString()}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 px-12 pb-10 mt-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="border border-[#264de4] text-[#264de4] px-6 py-2 rounded-md hover:bg-blue-50 transition font-medium"
        >
          Kembali
        </button>
        <button
          onClick={handleCheckout}
          className="bg-[#264de4] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
}
