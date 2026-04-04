import prisma from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import bcrypt from "bcrypt";
import { sign, type Secret, type SignOptions } from "jsonwebtoken";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

export class AuthService {
  private signToken(user: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) throw new AppError("JWT_SECRET is not configured", 500);

  const options: SignOptions = {
    subject: user.id,
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

  return sign({ email: user.email }, secret, options);
}


  async register(dto: RegisterDto) {
    const email = dto.email?.trim().toLowerCase();
    if (!email) throw new AppError("email is required", 400);
    if (!dto.password || dto.password.length < 6) throw new AppError("password must be at least 6 chars", 400);

    const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
if (existing) throw new AppError("Email already in use", 409);


    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
      },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });

    const token = this.signToken({ id: user.id, email: user.email });

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    if (!email) throw new AppError("email is required", 400);
    if (!dto.password) throw new AppError("password is required", 400);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, firstName: true, lastName: true },
    });

    if (!user) throw new AppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new AppError("Invalid credentials", 401);

    const token = this.signToken({ id: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      token,
    };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  }
  async updateProfile(userId: string, dto: {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, passwordHash: true },
  });
  if (!user) throw new AppError("User not found", 404);


  if (dto.newPassword) {
    if (!dto.currentPassword) throw new AppError("Current password is required", 400);
    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new AppError("Current password is incorrect", 401);
    if (dto.newPassword.length < 6) throw new AppError("New password must be at least 6 chars", 400);
  }

  if (dto.email && dto.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new AppError("Email already in use", 409);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
      ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
      ...(dto.email ? { email: dto.email.trim().toLowerCase() } : {}),
      ...(dto.newPassword ? { passwordHash: await bcrypt.hash(dto.newPassword, 10) } : {}),
    },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  const token = this.signToken({ id: updated.id, email: updated.email });
  return { user: updated, token };
}
}
