const knex = require('../../app/knex');

exports.getCategories = async (req, res) => {
  try {
    const data = await knex('categories').select('*');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const [id] = await knex('categories').insert({ name }).returning('id');
    res.json({ success: true, message: 'Category added', id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await knex('categories').where({ id }).update({ name });
    res.json({ success: true, message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah ada produk di kategori ini
    const products = await knex("products").where({ category_id: id });

    if (products.length > 0) {
      // Soft delete semua produk di kategori ini
      await knex("products")
        .where({ category_id: id })
        .update({ deleted_at: knex.fn.now(), is_deleted: true });
    }

    // Soft delete kategori
    await knex("categories")
      .where({ id })
      .update({ deleted_at: knex.fn.now() });

    res.json({ success: true, message: "Category soft deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


