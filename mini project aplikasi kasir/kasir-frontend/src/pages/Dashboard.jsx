import { useState, useEffect } from "react";
import { ShoppingCart, User, Trash2, Plus, Minus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    image: null,
  });

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // 🔹 Hitung total harga
  const totalBill = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // 🔹 Fetch kategori
  const fetchCategories = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/categories`, axiosConfig);
  setCategories(res.data.data);
  if (!activeCategory && res.data.data.length > 0) {
    setActiveCategory(res.data.data[0].id);
  }
};


  // 🔹 Fetch produk berdasarkan kategori
  const fetchProductsByCategory = async (categoryId) => {
  if (!categoryId) return;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/products`, axiosConfig);
    const allProducts = res.data.data || []; // pastikan selalu array
    const filtered = allProducts.filter((p) => p.category_id === categoryId);
    setProducts(filtered);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
  }
};


  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProductsByCategory(activeCategory);
  }, [activeCategory]);

  // 🔹 Tambah kategori
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return alert("Nama kategori tidak boleh kosong.");
    try {
      await axios.post(`${API_BASE_URL}/api/categories`, { name: newCategory }, axiosConfig);
      setShowCategoryModal(false);
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah kategori");
    }
  };

  // 🔹 Tambah produk
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { name, price, stock, category_id, image } = newProduct;
    if (!name || !price || !stock || !category_id)
      return alert("Semua field wajib diisi.");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category_id", category_id);
      if (image) formData.append("image", image);

      await axios.post(`${API_BASE_URL}/api/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setShowProductModal(false);
      setNewProduct({ name: "", price: "", stock: "", category_id: "", image: null });
      fetchProductsByCategory(activeCategory);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah produk");
    }
  };

  // 🔹 Hapus kategori
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/categories/${id}`, axiosConfig);
      fetchCategories();
      if (activeCategory === id) setActiveCategory(null);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus kategori");
    }
  };

  // 🔹 Hapus produk
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, axiosConfig);
      fetchProductsByCategory(activeCategory);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus produk");
    }
  };

  // 🛒 Tambah ke keranjang
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // ➕ Tambah qty
  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // ➖ Kurangi qty
  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // 🗑️ Hapus item dari cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // 🔹 Checkout → kirim ke API transaksi
  const handleCheckout = async () => {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Token tidak ditemukan. Silakan login ulang.");
    navigate("/login");
    return;
  }

  // ✅ Gunakan qty, bukan quantity
  const items = cart.map((item) => ({
    product_id: item.id,
    quantity: Number(item.qty) || 0,
  }));

  const invalid = items.find((it) => it.quantity <= 0);
  if (invalid) {
    alert(`Jumlah produk ID ${invalid.product_id} tidak valid.`);
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:3000/api/transactions",
      { items },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.success) {
      const transaction = res.data.data.transaction;
      navigate("/payment-success", {
        state: { transactionId: transaction.id },
      });
      setCart([]);
    } else {
      alert(res.data.message || "Transaksi gagal.");
    }
  } catch (err) {
    console.error("Checkout Error:", err);
    alert(err.response?.data?.message || "Kesalahan saat checkout.");
  }
};


  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-[#264de4] text-white flex justify-between items-center px-8 py-4 shadow">
        <h1 className="text-lg font-bold tracking-wide">MASPOS</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-white text-[#264de4] px-3 py-1 rounded font-semibold hover:bg-blue-50 transition"
          >
            + Add Category
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-white text-[#264de4] px-3 py-1 rounded font-semibold hover:bg-blue-50 transition"
          >
            + Add Product
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="bg-white text-[#264de4] px-4 py-1 rounded font-semibold flex items-center gap-1 hover:bg-blue-50 transition"
          >
            <ShoppingCart size={16} /> Cart ({cart.length})
          </button>

          <div className="flex items-center gap-3 border-l border-white pl-3">
            <div className="flex items-center gap-2">
              <User className="text-white bg-white/20 rounded-full p-1" size={22} />
              <span className="text-sm font-medium">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1 px-3 py-1 rounded transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div className="flex gap-6 border-b border-gray-300 px-8 py-3 bg-white overflow-x-auto">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
            <button
              onClick={() => setActiveCategory(cat.id)}
              className={`font-medium whitespace-nowrap ${
                activeCategory === cat.id
                  ? "text-[#264de4]"
                  : "text-gray-600 hover:text-[#264de4]"
              }`}
            >
              {cat.name}
            </button>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full bg-white shadow-sm"
              title="Hapus kategori"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col"
          >
            <div className="relative">
              <img
                src={`${API_BASE_URL}/uploads/${product.image}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <span
                className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${
                  product.stock > 0
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock"}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
              <p className="text-gray-700 text-sm mb-3">
                Rp. {Number(product.price).toLocaleString()}
              </p>
              <div className="flex justify-between items-center mt-auto">
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`${
                    product.stock <= 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#264de4] hover:bg-blue-700"
                  } text-white text-xs font-semibold px-3 py-1 rounded transition`}
                >
                  + Add to Cart
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL BILL */}
      <div className="flex justify-end px-8 pb-6">
        <div className="bg-[#264de4] text-white px-6 py-2 rounded font-semibold shadow">
          Total Bill : Rp. {totalBill.toLocaleString()}
        </div>
      </div>

      {/* CART MODAL */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Shopping Cart</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Cart is empty</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">
                        Rp. {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm">{item.qty}</span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span>Rp. {totalBill.toLocaleString()}</span>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setShowCart(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={handleCheckout}
                className="bg-[#264de4] hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category name"
                className="border rounded w-full px-3 py-2 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#264de4] text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <input
                type="text"
                placeholder="Product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="border rounded w-full px-3 py-2 mb-3"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="border rounded w-full px-3 py-2 mb-3"
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
                className="border rounded w-full px-3 py-2 mb-3"
              />
              <select
                value={newProduct.category_id}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category_id: e.target.value })
                }
                className="border rounded w-full px-3 py-2 mb-3"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.files[0] })
                }
                className="border rounded w-full px-3 py-2 mb-3"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#264de4] text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
