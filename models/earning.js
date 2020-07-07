const mongoose = require("mongoose");

const EarningSchema = new mongoose.Schema({
  price: {
    type: Number,
    require: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const Earning = mongoose.model("Earning", EarningSchema);
module.exports = Earning;
