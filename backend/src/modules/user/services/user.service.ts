import prisma from "@/core/db";
import { ForbiddenError, NotFoundError, ValidationError } from "@/core/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "@/core/config/constants";
import { ChangePasswordInput } from "../types";

export class UserService {
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError();
    }
    return user;
  }

  static async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await this.getUserById(userId);

    const validatePassword = await bcrypt.compare(data.oldPassword, user.password);

    if (!validatePassword) {
      throw new ValidationError("invalid creadential");
    }

    const hashPassword = await bcrypt.hash(data.newPassword, 10);

    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword }
    });
  }

  static async logout(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  }

  static async refresh(token: string) {
    if (!token) {
      throw new ForbiddenError();
    }

    let decoded: { id: string; role: string };
    try {
      decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string; role: string };
    } catch (error) {
      throw new ForbiddenError();
    }

    const user = await this.getUserById(decoded.id);

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

    return { accessToken, refreshToken };
  }
}
