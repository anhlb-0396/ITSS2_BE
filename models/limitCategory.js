module.exports = (sequelize, DataTypes, Model) => {
  class LimitCategory extends Model {}
  LimitCategory.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      limit_money: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "LimitCategory", // We need to choose the model name
      tableName: "limitCategories",
      timestamps: false,
    }
  );
  return LimitCategory;
};
