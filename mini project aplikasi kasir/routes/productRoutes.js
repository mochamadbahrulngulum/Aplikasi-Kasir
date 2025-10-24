const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../app/controller/productController");

const router = express.Router();

// 🔹 Konfigurasi Multer agar upload ke folder uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");

    // ✅ Pastikan folder uploads ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gunakan timestamp agar unik
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 🔒 Proteksi semua route dengan JWT
router.use(authMiddleware);

// 🔹 CRUD routes
router.get("/", getProducts);
router.post("/", upload.single("image"), addProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
