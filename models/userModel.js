module.exports = (sequelize, DataTypes, Model) => {
  class User extends Model {}
  User.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      gmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      role: {
        type: DataTypes.ENUM,
        values: ["admin", "user"],
        defaultValue: "user",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: false,
      tableName: "users"
    }
  );
  return User;
};
