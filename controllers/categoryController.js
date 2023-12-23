const { Category, Icon, sequelize, QueryTypes } = require("../models/index");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: Icon,
    });

    return res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
