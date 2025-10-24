const jwt = require("jsonwebtoken");

const AuthMiddleware = (req, res, next) => {
  try {
    // Ambil header Authorization atau cookie token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const cookieToken = req.cookies?.token;

    // Ambil token dari header "Bearer ..." atau cookie
    const token =
      (authHeader && authHeader.replace(/^Bearer\s+/i, "").trim()) ||
      (cookieToken && cookieToken.trim());

    if (!token) {
      console.warn("AuthMiddleware: Token tidak ditemukan di header maupun cookie");
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan. Silakan login ulang.",
      });
    }

    // Pastikan APP_KEY terdefinisi
    if (!process.env.APP_KEY) {
      console.error("AuthMiddleware: APP_KEY belum diatur di environment variable");
      return res.status(500).json({
        success: false,
        message: "Kesalahan server: APP_KEY tidak terdefinisi.",
      });
    }

    // Verifikasi JWT
    const decoded = jwt.verify(token, process.env.APP_KEY);

    // Simpan payload user agar bisa diakses controller
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    // Tangani error token kedaluwarsa atau tidak valid
    if (err.name === "TokenExpiredError") {
      console.warn("JWT expired:", err.message);
      return res.status(403).json({
        success: false,
        message: "Sesi login telah berakhir. Silakan login kembali.",
      });
    }

    console.error("AuthMiddleware error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau rusak.",
    });
  }
};

module.exports = AuthMiddleware;
