require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const swaggerDocs = require("./swagger");
const cookieParser = require("cookie-parser");

// buat instance express dulu
const app = express();

// import knex
const knex = require("./app/knex");

// ambil konfigurasi host & port
let port = process.env.APP_PORT || "3000";
let host = process.env.APP_HOST || "localhost";

// import routes
const routes = require("./routes"); // route lama
const productRoutes = require("./routes/productRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/auth"); // route auth sudah ada
const categoryRoutes = require('./routes/categoryRoutes');
const authController = require("./app/controller/auth.controller");
const checkoutRoutes = require("./routes/checkoutRoutes");




// middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(cookieParser());

// route lama
routes(app, "/");

// route baru
app.use("/api/products", productRoutes);
app.use("/transactions", transactionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/auth", authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", checkoutRoutes);
app.use(
  cors({
    origin: "http://localhost:5173", // sesuaikan dengan frontend kamu
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// swagger
swaggerDocs.swagger(app);

// root page
app.get("/", (req, res) => {
  res.render("welcome", {
    text: "Hello, It's Work!",
  });
});

// 🔹 test koneksi database PostgreSQL
app.get("/test-db", async (req, res) => {
  try {
    const result = await knex.raw("SELECT NOW()");
    res.send(`Database connected! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection failed");
  }
});

// start server
app.listen(port, () => {
  console.log(`listening on http://${host}:${port}`);
});
