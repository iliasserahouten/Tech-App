import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private service = new AuthService()) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.register(req.body);
      // Retourner directement sans wrapper "data"
      return res.status(201).json(data);
    } catch (e) {
      return next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.login(req.body);
      // Retourner directement sans wrapper "data"
      return res.json(data);
    } catch (e) {
      return next(e);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = await this.service.me(userId);
      // Retourner directement sans wrapper "data"
      return res.json(data);
    } catch (e) {
      return next(e);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = await this.service.updateProfile(userId, req.body);
    return res.json(data);
  } catch (e) {
    return next(e);
  }
};
}