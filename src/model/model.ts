import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db';

export const User = sequelize.define('user', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  chatId: { type: DataTypes.BIGINT, allowNull: false },
  group: { type: DataTypes.STRING, allowNull: true },
});
