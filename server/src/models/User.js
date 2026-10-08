const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {},
  {
    collection: "users",
    strict: false,
  },
);

module.exports = model("User", UserSchema);
