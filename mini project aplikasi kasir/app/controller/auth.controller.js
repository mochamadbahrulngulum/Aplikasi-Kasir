const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

// ✅ LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.query()
      .select("id", "name", "email", "password", "created_at", "updated_at")
      .where("email", email)
      .first();

    if (!user) {
      return res.status(400).json({ message: "Email not found!" });
    }

    // Bandingkan password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password!" });
    }

    // Buat payload JWT (tidak menyertakan password)
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // Buat token JWT
    const token = jwt.sign(payload, process.env.APP_KEY, { expiresIn: "2h" });

    res.status(200).json({
      message: "Login success!",
      data: payload,
      token, // ⬅️ token dikirim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

// ✅ REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Cek apakah email sudah digunakan
    const existingUser = await User.query().where("email", email).first();
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const user = await User.query().insert({
      name,
      email,
      password: hashedPassword,
    });

    // Hapus password sebelum dikirim balik
    delete user.password;

    res.status(201).json({
      message: "User registered successfully!",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

module.exports = { login, register };
