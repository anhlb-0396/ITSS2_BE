const {
  Spending,
  Category,
  Icon,
  LimitCategory,
  sequelize,
  QueryTypes,
  Sequelize,
  Op,
} = require("../models/index");

exports.getAllSpendings = async (req, res) => {
  try {
    const spendings = await Spending.findAll({
      include: {
        model: Category,
        include: Icon,
      },
      order: [["date", "desc"]],
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
    const { money, note, date, categoryId } = req.body;
    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();

    // console.log(month,year);

    const categoryInMonth = await LimitCategory.findAll({
      where: {
        category_id: categoryId,
        [Sequelize.Op.and]: [
          Sequelize.where(
            Sequelize.fn("MONTH", Sequelize.col("date")),
            month + 1
          ),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
        ],
      },
    });

    if (categoryInMonth.length == 0) {
      return res.status(301).json({
        status: "redirect",
        message: `Bạn chưa đặt hạn mức chi tiêu trong tháng này! Vui lòng thiết lập hạn mức!`,
      });
    }

    const newSpending = await Spending.create({
      money,
      note,
      date: new Date(date),
      category_id: categoryId,
    });

    // Get totalMoney of this category that was spent in month
    const allSpendingsInMonth = await Spending.findAll({
      attributes: [
        "category_id",
        [Sequelize.fn("SUM", Sequelize.col("money")), "totalMoney"],
      ],
      where: {
        [Sequelize.Op.and]: [
          Sequelize.where(
            Sequelize.fn("MONTH", Sequelize.col("date")),
            month + 1
          ),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
          { category_id: categoryId },
        ],
      },
      group: ["category_id"],
    });

    const limitCategory = await LimitCategory.findAll({
      where: {
        [Sequelize.Op.and]: [
          Sequelize.where(
            Sequelize.fn("MONTH", Sequelize.col("date")),
            month + 1
          ),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
          { category_id: categoryId },
        ],
      },
      include: { model: Category, include: Icon },
      order: [["category_id", "asc"]],
    });

    const totalSpentMoney = allSpendingsInMonth[0].dataValues.totalMoney;
    const limitMoney = limitCategory[0].dataValues.limit_money;
    const percentage = Math.round((totalSpentMoney / limitMoney) * 100);

    let warning = "";

    if (percentage >= 90) {
      warning = `Tháng này bạn đã tiêu hết ${percentage} phần hạn mức ${limitCategory[0].dataValues.Category.name} rồi đó. Cẩn thận cuối tháng ăn mì tôm nha!`;
    }

    return res.status(201).json({
      status: "success",
      message: "Create new spending successfully",
      data: {
        newSpending,
        warning,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getAllSpendingsStatistic = async (req, res) => {
  try {
    const { month, year } = { ...req.query };
    if (!month && !year) {
      return res.status(404).json({
        status: "fail",
        message: "Please provide month or year information",
      });
    }

    if (!month) {
      const spendings = await Spending.findAll({
        attributes: [
          [Sequelize.fn("MONTH", Sequelize.col("date")), "month"],
          [Sequelize.fn("SUM", Sequelize.col("money")), "totalSpendings"],
        ],
        where: Sequelize.literal(`YEAR(date) = ${year}`),
        group: [Sequelize.fn("MONTH", Sequelize.col("date"))],
      });

      // console.log(spendings);

      for (let i = 0; i < spendings.length; i++) {
        const categoriesSpendingsInMonth = await Spending.findAll({
          attributes: [
            "category_id",
            [Sequelize.fn("SUM", Sequelize.col("money")), "totalSpendings"],
          ],
          include: {
            model: Category,
          },
          where: {
            [Sequelize.Op.and]: [
              Sequelize.where(
                Sequelize.fn("MONTH", Sequelize.col("date")),
                spendings[i].dataValues.month
              ),
              Sequelize.where(
                Sequelize.fn("YEAR", Sequelize.col("date")),
                year
              ),
            ],
          },
          group: ["category_id"],
        });
        // console.log(categoriesSpendingsInMonth);
        spendings[i].dataValues.categories = categoriesSpendingsInMonth;
      }

      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      const handledSpendings = months.map((month) => {
        let returnObj = null;
        for (let i = 0; i < spendings.length; i++) {
          if (month == spendings[i].dataValues.month) {
            returnObj = spendings[i].dataValues;
            break;
          }
        }
        if (returnObj == null) {
          returnObj = {
            month,
            totalSpendings: 0,
            categories: [],
          };
        }
        return returnObj;
      });

      return res.status(200).json({
        status: "success",
        data: {
          year,
          resultArray: handledSpendings,
        },
      });
    }

    // Get all spendings by month and year
    const spendings = await Spending.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("date")), "date"],
        [Sequelize.fn("SUM", Sequelize.col("money")), "totalAmount"],
      ],
      where: {
        [Sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("date")), month),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
        ],
      },
      group: [Sequelize.fn("DATE", Sequelize.col("date"))],
      order: [["date", "asc"]],
    });

    console.log(spendings);

    for (let i = 0; i < spendings.length; i++) {
      const categoriesSpendingsInDay = await Spending.findAll({
        attributes: [
          "category_id",
          [Sequelize.fn("SUM", Sequelize.col("money")), "totalSpendings"],
        ],
        include: {
          model: Category,
        },
        where: {
          date: spendings[i].dataValues.date,
        },
        group: ["category_id"],
      });
      spendings[i].dataValues.categories = categoriesSpendingsInDay;
    }

    return res.status(200).json({
      status: "success",
      data: {
        month,
        year,
        spendings,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getRatiosBetweenSpendingsAndLimits = async (req, res) => {
  try {
    // 1.Get The Current MONTH & YEAR
    const { month, year } = req.query;

    // 2.Get Total Spendings By Each Categories
    const allSpendingsInMonth = await Spending.findAll({
      attributes: [
        "category_id",
        [Sequelize.fn("SUM", Sequelize.col("money")), "totalMoney"],
      ],
      where: {
        [Sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("date")), month),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
        ],
      },
      group: ["category_id"],
    });

    // 3.Get Total Spendings Limit By Each Categories
    const limitCategories = await LimitCategory.findAll({
      where: {
        [Sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("date")), month),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
        ],
      },
      include: { model: Category, include: Icon },
      order: [["category_id", "asc"]],
    });

    const simplifiedLimitCategories = limitCategories.map((limitCategory) => ({
      category_id: limitCategory.category_id,
      limit_money: limitCategory.limit_money,
      name: limitCategory.Category.name,
      icon: {
        id: limitCategory.Category.Icon.id,
        content: limitCategory.Category.Icon.content,
        name: limitCategory.Category.Icon.name,
      },
    }));

    // 4.Devide and get the ratios between them
    // console.log(allSpendingsInMonth);
    const ratioSpendingsInMonth = simplifiedLimitCategories.map(
      (simplifiedLimitCategory) => {
        let totalUsedMoney = 0;
        let percentage = 0;
        const firstMatchedSpendingCategory = allSpendingsInMonth.find(
          (category) =>
            category.dataValues.category_id ==
            simplifiedLimitCategory.category_id
        );
        if (firstMatchedSpendingCategory) {
          totalUsedMoney = firstMatchedSpendingCategory.dataValues.totalMoney;
          percentage = Math.round(
            (totalUsedMoney / simplifiedLimitCategory.limit_money) * 100
          );
        }
        return {
          ...simplifiedLimitCategory,
          totalUsedMoney,
          percentage,
        };
      }
    );

    // console.log(allSpendingsInMonth,simplifiedLimitCategories);

    // 5.Return array of ratio by categories limit to the client
    return res.status(200).json({
      status: "success",
      data: {
        month,
        year,
        ratioSpendingsInMonth,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
