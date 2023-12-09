module.exports = (sequelize, DataTypes, Model) => {
  class Icon extends Model {}
  Icon.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Icon",
      timestamps: false,
      tableName: "icons"
    }
  );
  return Icon;
};
