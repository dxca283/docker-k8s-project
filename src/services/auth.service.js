import logger from "../config/logger.js";
import bcrypt from "bcryptjs";
import { db } from "../config/database.js";
import { user } from "../models/user.model.js";
import { eq } from "drizzle-orm";

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error("Password hashing error", error);
    throw new Error("Password hashing failed");
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error("Password comparison error", error);
    throw new Error("Password comparison failed");
  }
};
export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0)
      throw new Error('User with this email already exists');

    const password_hash = await hashPassword(password);

    const [newUser] = await db
      .insert(user)
      .values({ name, email, password: password_hash, role })
      .returning();

    logger.info(`User ${newUser.email} created successfully`);
    return newUser;
  } catch (e) {
    logger.error(`Error creating the user: ${e}`);
    throw e;
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(password, existingUser.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    logger.info(`User ${existingUser.email} authenticated successfully`);
    return existingUser;
  } catch (e) {
    logger.error(`Error authenticating user: ${e}`);
    throw e;
  }
};

