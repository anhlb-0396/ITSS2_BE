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

exports.createCategory = async (req, res) => {
  try {
    const { iconName, categoryName } = req.body;

    const icon = await Icon.findOne({
      where: {
        name: iconName,
      },
    });

    if (!icon) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot find the icon in the list",
      });
    }

    const newCategory = await Category.create({
      name: categoryName,
      icon_id: icon.dataValues.id,
    });

    return res.status(201).json({
      status: "success",
      data: {
        newCategory,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};
