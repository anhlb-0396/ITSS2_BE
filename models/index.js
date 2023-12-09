const { Sequelize, DataTypes, Model, QueryTypes, Op } = require("sequelize");
const sequelize = new Sequelize("personal_expenditure_management", "root", "Lebaoanh194470@", {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
});

// Connecting to MySQL Database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectDB();

const db = {Sequelize, sequelize, QueryTypes, Op};

// Include Models
db.User = require("./userModel")(sequelize, DataTypes, Model);
db.Icon = require("./iconModel")(sequelize, DataTypes, Model);
db.Category = require("./categoryModel")(sequelize, DataTypes, Model);
db.Spending = require("./spendingModel")(sequelize, DataTypes, Model);
db.LimitCategory = require("./limitCategory")(sequelize, DataTypes, Model);

// Define the relations between many models

db.Category.belongsTo(db.Icon, {
  foreignKey: "icon_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

db.Icon.hasOne(db.Category, {
  foreignKey: "icon_id",
});

db.Spending.belongsTo(db.Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

db.Category.hasMany(db.Spending, {
  foreignKey: "category_id",
});

db.LimitCategory.belongsTo(db.Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

db.Category.hasMany(db.LimitCategory, {
  foreignKey: "category_id",
});

db.sequelize.sync();

module.exports = db;
