const { expressjwt: jwt } = require("express-jwt");
const { JWT_SECRET } = require("../util/config");
const Cookies = require("js-cookie");
const jwtDecode = require("jwt-decode");

// const jwtMiddleware = jwt({
//   secret: JWT_SECRET,
//   algorithms: ["HS256"],
//   getToken: (req) => {
//     const token = req.cookies.token;
//      console.log("Request headers in jwtMiddleware:", req.headers);
//     if (token) {
//       return token;
//     }
//     return null;
//   },
// }).unless({
//   path: ["/auth/login", "/api/get-token"],
// });


const jwtMiddleware = jwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => {
    console.log("Request headers in jwtMiddleware:", req.headers);

    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    console.log("Extracted token:", token);
    return token;
  },
}).unless({
  path: ["/auth/login", "/api/get-token"],
});

module.exports = jwtMiddleware;
