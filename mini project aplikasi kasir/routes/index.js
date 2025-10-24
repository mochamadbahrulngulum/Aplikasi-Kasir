const AuthRouter = require("./auth");
const UserRouter = require("./user");

const routes = (app, prefix) => {
  app.use(prefix, AuthRouter);
  app.use(prefix, UserRouter);
};

module.exports = routes;
