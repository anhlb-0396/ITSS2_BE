module.exports = (sequelize, DataTypes, Model) => {
  class Category extends Model {}
  Category.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      icon_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "Category", // We need to choose the model name
      timestamps: false,
      tableName: "categories"
    }
  );
  return Category;
};
