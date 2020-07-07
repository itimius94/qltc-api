const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const moment = require("moment");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.set("views", "./views");

const categoryModel = require("./models/category");
const spendingModel = require("./models/spending");
const earningModel = require("./models/earning");
const commonModel = require("./models/common");

const uri =
  "mongodb+srv://itimius94:matkhau123@cluster0-ie86k.gcp.mongodb.net/lux?retryWrites=true&w=majority";
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.log(err));

// API Category
app.get("/category", async (req, res) => {
  try {
    const categories = await categoryModel.find({});

    res.send(categories);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/category", async (req, res) => {
  try {
    const categories = new categoryModel(req.body);

    await categories.save();
    res.send({
      status: 200,
      message: "Add success!!",
    });
  } catch (err) {
    res.status(500).send(err);
  }
});
// END API Category

// API Spending
app.get("/spending", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const count = await spendingModel.countDocuments();
    const listSpending = await spendingModel
      .find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.send({
      data: listSpending,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/spending", async (req, res) => {
  const spending = new spendingModel(req.body);

  try {
    await spending.save();
    res.send({
      status: 200,
      message: "Add success!!",
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
// END API Spending

// API Earning
app.get("/earning", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const count = await earningModel.countDocuments();
    const listEarning = await earningModel
      .find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.send({
      data: listEarning,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/earning", async (req, res) => {
  const earning = new earningModel(req.body);

  try {
    await earning.save();
    res.send({
      status: 200,
      message: "Add success!!",
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
// END API Earning

// API Common
app.get("/common", async (req, res) => {
  try {
    const price = await commonModel.find({});

    res.send(price);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/common", async (req, res) => {
  const common = new commonModel(req.body);

  try {
    await common.save();
    res.send({
      status: 200,
      message: "Add success!!",
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
// END API Common

app.get("/report/spending", async (req, res) => {
  const { month = moment().month(), year = moment().year() } = req.query;
  const currentDate = moment().set({ year: year, month: month - 1 });
  const startMonth = moment(currentDate).startOf("month");
  const endMonth = moment(currentDate).endOf("month");

  try {
    const listSpending = await spendingModel.find({});
    const listFilter = listSpending.filter(
      (item) =>
        moment(item.date, "YYYY-MM-DD")
          .startOf("day")
          .diff(moment(startMonth).startOf("day"), "days") >= 0 &&
        moment(endMonth)
          .startOf("day")
          .diff(moment(item.date, "YYYY-MM-DD").startOf("day"), "days") >= 0
    );

    const data = {};
    listFilter.forEach((item) => {
      if (data[item.category_id]) {
        data[item.category_id] = {
          ...data[item.category_id],
          price: data[item.category_id].price + item.price,
        };
      } else {
        data[item.category_id] = {
          category_id: item.category_id,
          price: item.price,
          color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)})`,
        };
      }
    });

    res.send(Object.values(data));
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/report", async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    const listSpending = await spendingModel.find({});
    const listEarning = await earningModel.find({});
    const prices = await commonModel.find({});
    const dataMonth = {};
    const dataMonthEarning = [];

    for (let i = 0; i < 3; i++) {
      const startMonth = moment().subtract(i, "month").startOf("month");
      const endMonth = moment().subtract(i, "month").endOf("month");

      const listFilter = listSpending.filter(
        (item) =>
          moment(item.date, "YYYY-MM-DD")
            .startOf("day")
            .diff(moment(startMonth).startOf("day"), "days") >= 0 &&
          moment(endMonth)
            .startOf("day")
            .diff(moment(item.date, "YYYY-MM-DD").startOf("day"), "days") >= 0
      );

      const listFilterEarning = listEarning.filter(
        (item) =>
          moment(item.date, "YYYY-MM-DD")
            .startOf("day")
            .diff(moment(startMonth).startOf("day"), "days") >= 0 &&
          moment(endMonth)
            .startOf("day")
            .diff(moment(item.date, "YYYY-MM-DD").startOf("day"), "days") >= 0
      );

      dataMonthEarning.push(
        listFilterEarning.reduce((total, item) => total + item.price, 0) + prices[0].price
      );

      const data = {};
      listFilter.forEach((item) => {
        if (data[item.category_id]) {
          data[item.category_id] = {
            ...data[item.category_id],
            price: data[item.category_id].price + item.price,
          };
        } else {
          data[item.category_id] = {
            category_id: item.category_id,
            price: item.price,
            color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)})`,
          };
        }
      });

      dataMonth[moment().month() - i] = [];
      categories.forEach((item) => {
        if (data[item._id]) {
          dataMonth[moment().month() - i].push({
            price: data[item._id].price,
            name: item.name,
          });
        } else {
          dataMonth[moment().month() - i].push({
            price: 0,
            name: item.name,
          });
        }
      });
    }

    res.send({
      spending: Object.values(dataMonth),
      earning: dataMonthEarning.reverse(),
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
