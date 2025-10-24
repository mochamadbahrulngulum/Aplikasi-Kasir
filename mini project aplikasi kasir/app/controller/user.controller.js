const User = require("../model/user.model");

const bcrypt = require("bcryptjs/dist/bcrypt");

const index = async (req, res) => {
  try {
    const users = await User.query();

    res.status(200).json({
      status: 200,
      message: "OK!",
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

const store = async (req, res) => {
  try {
    const user = await User.query().insert({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    });

    res.status(200).json({
      status: 200,
      message: "Success create!",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

const show = async (req, res) => {
  try {
    const user = await User.query().findById(req.params.id);

    res.status(200).json({
      status: 200,
      message: "OK!",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

const update = async (req, res) => {
  try {
    const user = await User.query()
      .findById(req.params.id)
      .patch({
        name: req.body.name,
        email: req.body.email,
      });

      if(req.body.password){
        await User.query()
          .findById(req.params.id)
          .patch({
            password: await bcrypt.hash(req.body.password, 10),
          });
      }

    res.status(200).json({
      status: 200,
      message: "Success update!",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

const destroy = async (req, res) => {
  try {
    const user = await User.query().deleteById(req.params.id);

    res.status(200).json({
      status: 200,
      message: "Success delete!",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
};
