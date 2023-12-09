const { Spending, Category,Icon, sequelize, QueryTypes, Sequelize } = require("../models/index");

exports.getAllSpendings = async (req, res) => {
    try {
      const spendings = await Spending.findAll({
        include: {
            model: Category,
            include: Icon
        },
        order: [['date','desc']]
      });

      // Group spendings by date
      const groupedSpendings = spendings.reduce((result, spending) => {
        const date = spending.date;
        if (!result[date]) result[date] = [];
        result[date].push(spending);
        return result;
      }, {});

      // Convert the grouped spendings into an array
      const resultArray = Object.keys(groupedSpendings).map((date) => ({
        date,
        spendings: groupedSpendings[date],
      }));
      
      return res.status(200).json({
        status: "success",
        results: spendings.length,
        data: {
          spendings: resultArray,
        },
      });
    } catch (error) {
      return res.status(404).json({
        status: "fail",
        message: error.message,
      });
    }
  };

exports.createSpending = async (req, res) => {
    try {
      const {money, note, date, categoryId} = req.body
      const newSpending = await Spending.create({
        money, note, date: new Date(date), category_id: categoryId
      })
      
      return res.status(201).json({
        status: "success",
        message: "Create new spending successfully",
        data: {
          newSpending
        },
      });
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: error?.errors[0]?.message,
      });
    }
  };