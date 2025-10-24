const express = require("express");
const router = express.Router();

// POST /checkout
router.post("/checkout", (req, res) => {
  try {
    const { cart, total } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart kosong!" });
    }

    console.log("🧾 Checkout diterima:");
    console.log("Cart:", cart);
    console.log("Total:", total);

    // 👉 di sini kamu bisa tambahkan logika simpan ke database (orders, transaksi, dsb)

    return res.status(200).json({
      success: true,
      message: "Checkout berhasil diproses",
      total,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ success: false, message: "Server error!" });
  }
});

module.exports = router;
