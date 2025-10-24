const knex = require("../knex");

// ✅ CREATE TRANSACTION
const createTransaction = async (req, res) => {
  const { items } = req.body;
  const user_id = req.user?.id;

  if (!user_id) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ success: false, message: "Items are required" });

  try {
    const result = await knex.transaction(async (trx) => {
      const productIds = items.map((i) => i.product_id);

      // 🔒 Lock produk yang akan digunakan
      const products = await trx("products").whereIn("id", productIds).forUpdate();

      const prodMap = {};
      products.forEach((p) => (prodMap[p.id] = p));

      let total = 0;
      const txItems = [];

      for (const it of items) {
  const p = prodMap[it.product_id];
  if (!p) {
    throw { status: 404, message: `Produk dengan ID ${it.product_id} tidak ditemukan` };
  }

  if (p.stock < it.quantity) {
    throw { status: 400, message: `Stok produk "${p.name}" tidak mencukupi` };
  }

  console.log("DEBUG ITEM:", {
    product_id: it.product_id,
    price: p.price,
    quantity: it.quantity,
    subtotal: p.price * it.quantity,
  });

  const subtotal = Number(p.price) * Number(it.quantity);
  if (isNaN(subtotal)) {
    throw { status: 400, message: `Subtotal NaN untuk produk "${p.name}"` };
  }

  total += subtotal;
  txItems.push({ product_id: p.id, quantity: it.quantity, subtotal });
}


      // 💾 Simpan transaksi
      const [trxRecord] = await trx("transactions")
        .insert({
          user_id,
          total,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })
        .returning("id");

      const transaction_id = trxRecord.id || trxRecord;

      // 💾 Simpan item transaksi
      await trx("transaction_items").insert(
        txItems.map((ti) => ({ ...ti, transaction_id }))
      );

      // 📉 Kurangi stok
      for (const it of txItems) {
        await trx("products").where("id", it.product_id).decrement("stock", it.quantity);
      }

      // Ambil detail transaksi untuk dikirim kembali
      const transaction = await trx("transactions").where({ id: transaction_id }).first();
      const itemsDetail = await trx("transaction_items as ti")
        .join("products as p", "p.id", "ti.product_id")
        .select("p.name", "ti.quantity", "ti.subtotal")
        .where("ti.transaction_id", transaction_id);

      // Pastikan semua angka dalam bentuk number
      transaction.total = Number(transaction.total);
      const itemsParsed = itemsDetail.map((i) => ({
        name: i.name,
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal),
      }));

      return { transaction, items: itemsParsed };
    });

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil disimpan.",
      data: result,
    });
  } catch (err) {
    console.error("Transaction Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Gagal melakukan transaksi.",
    });
  }
};

// ✅ GET ALL TRANSACTIONS
const getTransactions = async (req, res) => {
  try {
    const transactions = await knex("transactions")
      .join("users", "transactions.user_id", "users.id")
      .select(
        "transactions.id",
        "transactions.total",
        "transactions.created_at",
        "users.username as cashier"
      )
      .orderBy("transactions.created_at", "desc");

    // Pastikan total adalah number
    const sanitized = transactions.map((t) => ({
      ...t,
      total: Number(t.total),
    }));

    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET TRANSACTION DETAIL
const getTransactionDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await knex("transactions").where({ id }).first();
    if (!transaction) return res.status(404).json({ success: false, message: "Not found" });

    const items = await knex("transaction_items as ti")
      .join("products as p", "p.id", "ti.product_id")
      .select("p.name", "ti.quantity", "ti.subtotal")
      .where("ti.transaction_id", id);

    // pastikan semua angka diubah ke number
    transaction.total = Number(transaction.total);
    const parsedItems = items.map((it) => ({
      name: it.name,
      quantity: Number(it.quantity),
      subtotal: Number(it.subtotal),
    }));

    res.json({
      success: true,
      data: { transaction, items: parsedItems },
    });
  } catch (err) {
    console.error("Get Transaction Detail Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionDetail,
};
