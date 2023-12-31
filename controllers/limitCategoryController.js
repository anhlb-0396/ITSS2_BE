const {
  LimitCategory,
  Category,
  Icon,
  sequelize,
  QueryTypes,
  Sequelize,
} = require("../models/index");

const _ = require("lodash");

// exports.getAllLimitCategories = async (req, res) => {
//   try {
//     const limitCategories = await LimitCategory.findAll({
//       attributes: [
//         "id",
//         "limit_money",
//         "category_id",
//         [
//           sequelize.fn(
//             "CONCAT",
//             sequelize.fn("MONTH", sequelize.col("date")),
//             "/",
//             sequelize.fn("YEAR", sequelize.col("date"))
//           ),
//           "date",
//         ],
//       ],
//       include: {
//         model: Category,
//         include: Icon,
//       },
//     });

//     return res.status(200).json({
//       status: "success",
//       results: limitCategories.length,
//       data: {
//         limitCategories,
//       },
//     });
//   } catch (error) {
//     return res.status(404).json({
//       status: "fail",
//       message: error,
//     });
//   }
// };

exports.getAllLimitCategories = async (req, res) => {
  try {
    const limitCategories = await LimitCategory.findAll({
      attributes: [
        "id",
        "limit_money",
        "category_id",
        [
          sequelize.fn(
            "CONCAT",
            sequelize.fn("MONTH", sequelize.col("date")),
            "/",
            sequelize.fn("YEAR", sequelize.col("date"))
          ),
          "date",
        ],
      ],
      include: {
        model: Category,
        include: Icon,
      },
    });

    // Group data by date (month, year)
    const groupedData = _.groupBy(limitCategories, "date");

    // Transform grouped data for response
    const transformedData = Object.keys(groupedData).map((date) => {
      const categories = groupedData[date].map((item) => ({
        id: item.id,
        limit_money: item.limit_money,
        category_id: item.category_id,
        Category: item.Category,
      }));

      return {
        date,
        categories,
      };
    });

    return res.status(200).json({
      status: "success",
      results: transformedData.length,
      data: {
        limitCategories: transformedData,
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
    const { limitMoney, date, categoryId } = req.body;

    const CategoryExistedInMonth = await LimitCategory.findAll({
      where: {
        category_id: categoryId,
        [Sequelize.Op.and]: [
          Sequelize.where(
            Sequelize.fn("MONTH", Sequelize.col("date")),
            parseInt(date.split("-")[1])
          ),
          Sequelize.where(
            Sequelize.fn("YEAR", Sequelize.col("date")),
            parseInt(date.split("-")[0])
          ),
        ],
      },
    });

    // console.log(isCategoryExistedInMonth);

    if (CategoryExistedInMonth.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "You have already created this category limit in this month",
      });
    }

    const newLimitCategory = await LimitCategory.create({
      limit_money: limitMoney,
      date: new Date(date),
      category_id: categoryId,
    });

    return res.status(201).json({
      status: "success",
      message: "Create new limit for category successfully",
      data: {
        newLimitCategory,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};
