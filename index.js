if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/service.prod.js");
} else {
  module.exports = require("./dist/service.js");
}
