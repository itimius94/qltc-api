const mongoose = require("mongoose");

const CommonSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
});

const Common = mongoose.model("Common", CommonSchema);
module.exports = Common;
