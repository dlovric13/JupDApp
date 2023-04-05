const { expressjwt: jwt } = require("express-jwt");
const { JWT_SECRET } = require("../util/config");

const jwtMiddleware = jwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => req.header("x-auth-token"),
}).unless({
  path: ["/auth/login"],
});

module.exports = jwtMiddleware;
