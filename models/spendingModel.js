module.exports = (sequelize, DataTypes, Model) => {
  class Spending extends Model {}
  Spending.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      money: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING(100),
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "Spending", // We need to choose the model name
      tableName: "spendings",
      timestamps: true,
    }
  );
  return Spending;
};
