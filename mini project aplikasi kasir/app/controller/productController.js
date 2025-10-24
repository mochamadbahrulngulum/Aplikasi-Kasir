const path = require("path");
const knex = require("../knex");

// GET /products
const getProducts = async (req, res) => {
  try {
    const data = await knex("products")
      .where({ is_deleted: false })
      .select("*");
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /products (upload gambar)
const addProduct = async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const [id] = await knex("products")
      .insert({ name, price, stock, category_id, image })
      .returning("id");

    res.status(201).json({ id, name, price, stock, image });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category_id } = req.body;

    const updateData = {
      name,
      price,
      stock,
      category_id,
      updated_at: knex.fn.now(),
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    await knex("products").where({ id }).update(updateData);
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /products/:id (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await knex("products")
      .where({ id })
      .update({ is_deleted: true, deleted_at: knex.fn.now() });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Export semua fungsi di akhir
module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
