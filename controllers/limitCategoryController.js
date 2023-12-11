const { LimitCategory, Category, Icon, sequelize, QueryTypes } = require("../models/index");

exports.getAllLimitCategories = async (req, res) => {
    try {
      const limitCategories = await LimitCategory.findAll({
        attributes:[
          "id", "limit_money", "category_id",
          [sequelize.fn("CONCAT",sequelize.fn("MONTH", sequelize.col("date")),"/",sequelize.fn("YEAR", sequelize.col("date"))), "date"],
        ],
        include: {
            model: Category,
            include: Icon
        },
      });
  
      return res.status(200).json({
        status: "success",
        results: limitCategories.length,
        data: {
          limitCategories,
        },
      });
    } catch (error) {
      return res.status(404).json({
        status: "fail",
        message: error,
      });
    }
  };

exports.createLimitCategorySpending = async (req, res) => {
    try {
      const { limitMoney, date, categoryId } = req.body
      const newLimitCategory = await LimitCategory.create({
        limit_money: limitMoney,
        date: new Date(date), 
        category_id: categoryId
      })
      
      return res.status(201).json({
        status: "success",
        message: "Create new limit for category successfully",
        data: {
            newLimitCategory
        },
      });
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: error?.errors[0]?.message,
      });
    }
  };