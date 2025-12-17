import logger from "../config/logger.js";
import { getAllUsers } from "../services/user.service.js";

export const fetchAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      users,
      message: "Users fetched successfully",
      count: users.length,
    });
  } catch (error) {
    logger.error("Error in fetchAllUsers controller:", error);
    next(error);
  }
};
