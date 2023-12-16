const { Icon, sequelize, QueryTypes } = require("../models/index");

exports.getAllIcons = async (req, res) => {
  try {
    const icons = await Icon.findAll();

    return res.status(200).json({
      status: "success",
      results: icons.length,
      data: {
        icons,
      },
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.createIcon = async (req, res) => {
    try {
      const {content, name } = req.body;
      const newIcon = await Icon.create({
        content, name
      })
      
      return res.status(201).json({
        status: "success",
        data: {
          icon: newIcon,
        },
      });
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: error,
      });
    }
  };