const mongoose = require("mongoose");

const SpendingSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  category_id: {
    type: String,
    required: true,
  },
});

const Spending = mongoose.model("Spending", SpendingSchema);
module.exports = Spending;
