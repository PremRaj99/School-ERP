import prisma from "@/core/db";
import { NotFoundError, ValidationError } from "@/core/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "@/core/config/constants";
import { LoginInput } from "../types";

export class AuthService {
  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: data.username }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const validatePassword = await bcrypt.compare(data.password, user.password);

    if (!validatePassword) {
      throw new ValidationError("invalid creadential");
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15s"
    });

    const refreshToken = jwt.sign({ id: user.id, role: user.role }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d"
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return { accessToken, refreshToken, user };
  }

  static async signup(username: string, password: string) {
    const hashPassword = await bcrypt.hash(password, 10);

    try {
      return await prisma.user.create({
        data: {
          username,
          password: hashPassword,
          role: "Admin",
        }
      });
    } catch (error) {
      console.error("SIGNUP PRISMA ERROR:", error);
      throw new ValidationError();
    }
  }
}
