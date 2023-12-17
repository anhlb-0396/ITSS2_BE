const { Spending, Category,Icon, sequelize, QueryTypes, Sequelize, Op } = require("../models/index");

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
        message: error,
      });
    }
  };

exports.getAllSpendingsStatistic = async (req,res) =>{
  try {
    const {month, year} = {...req.query};
    if (!month && !year) {
      return res.status(404).json({
        status: "fail",
        message: "Please provide month or year information",
      });
    }

    if(!month){
      const spendings = await Spending.findAll({
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
          [Sequelize.fn('SUM', Sequelize.col('money')), 'totalSpendings'],
        ],
        where: Sequelize.literal(`YEAR(date) = ${year}`),
        group: [Sequelize.fn('MONTH', Sequelize.col('date'))],
      });

      // console.log(spendings);


      for(let i=0;i<spendings.length;i++){
        const categoriesSpendingsInMonth = await Spending.findAll({
          attributes: [
            "category_id",
            [Sequelize.fn('SUM', Sequelize.col('money')), 'totalSpendings']
          ],
          include:{
            model: Category,
          },
          where: {
            [Sequelize.Op.and]: [
              Sequelize.where(
                Sequelize.fn('MONTH', Sequelize.col('date')),
                spendings[i].dataValues.month
              ),
              Sequelize.where(
                Sequelize.fn('YEAR', Sequelize.col('date')),
                year
              ),
            ],
          },
          group: ["category_id"]
        });
        // console.log(categoriesSpendingsInMonth);
        spendings[i].dataValues.categories = categoriesSpendingsInMonth
      }

      return res.status(200).json({
        status: "success",
        data: {
          year,
          resultArray :spendings,
        },
      });
    }

    // Get all spendings by month and year
    const spendings = await Spending.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('date')), 'date'],
        [Sequelize.fn('SUM', Sequelize.col('money')), 'totalAmount'],
      ],
      where: {
        [Sequelize.Op.and]: [
          Sequelize.where(
            Sequelize.fn('MONTH', Sequelize.col('date')),
            month
          ),
          Sequelize.where(
            Sequelize.fn('YEAR', Sequelize.col('date')),
            year
          ),
        ],
      },
      group: [Sequelize.fn('DATE', Sequelize.col('date'))],
      order: [['date','asc']]
    });

    console.log(spendings);

    for (let i = 0; i < spendings.length; i++) {
      const categoriesSpendingsInDay = await Spending.findAll({
        attributes: [
          "category_id",
          [Sequelize.fn('SUM', Sequelize.col('money')), 'totalSpendings']
        ],
        include:{
          model: Category,
        },
        where: {
          date: spendings[i].dataValues.date
        },
        group: ["category_id"]
      });
      spendings[i].dataValues.categories = categoriesSpendingsInDay
    }

    // const allDetailSpendings = await Spending.findAll({
    //   include: {
    //       model: Category,
    //       include: Icon
    //   },
    //   where: {
    //     [Sequelize.Op.and]: [
    //       Sequelize.where(
    //         Sequelize.fn('MONTH', Sequelize.col('date')),
    //         month
    //       ),
    //       Sequelize.where(
    //         Sequelize.fn('YEAR', Sequelize.col('date')),
    //         year
    //       ),
    //     ],
    //   },
    //   order: [['date','desc']]
    // });

    // // Group spendings by date
    // const groupedSpendings = allDetailSpendings.reduce((result, spending) => {
    //   const date = spending.date;
    //   if (!result[date]) result[date] = [];
    //   result[date].push(spending);
    //   return result;
    // }, {});

    // // Convert the grouped spendings into an array
    // const resultArray = Object.keys(groupedSpendings).map((date) => ({
    //   date,
    //   spendings: groupedSpendings[date],
    // }));

    // console.log(spendings);

    // resultArray.forEach((dayOfDetail)=>{
    //   spendings.forEach(day=>{
    //     if(dayOfDetail.date === day.dataValues.date){
    //       dayOfDetail.totalSpendings = day.dataValues.totalAmount
    //     }
    //   })
    // })

    return res.status(200).json({
      status: "success",
      data: {
        month,
        year,
        spendings
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
}