const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
require("./models/index");
const iconRouter = require("./routes/iconRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const spendingRouter = require("./routes/spendingRoutes");
const limitCategoryRouter = require("./routes/limitCategoryRoutes");

dotenv.config({
  path: "./config.env",
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

// Declare all routes using in app
app.use("/icons", iconRouter);
app.use("/categories", categoryRouter);
app.use("/spendings", spendingRouter);
app.use("/limits", limitCategoryRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.listen(process.env.NODE_APP_PORT_NUMBER, () =>
  console.log(`server is running in port ${process.env.NODE_APP_PORT_NUMBER}`)
);
