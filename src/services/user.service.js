import { db } from "../config/database.js";
import logger from "../config/logger.js";
import { user } from "../models/user.model.js";

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user);
    return allUsers;
  } catch (error) {
    logger.error("Error fetching all users:", error);
    throw error;
  }
};
