import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Token } from "../utils/tokenUtility";
import dotenv from "dotenv";
import { Student } from "../model/student/studentModel"; // Import your User model

dotenv.config();

// Define the expected structure of JWT payload
interface TokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    role?: string;
    email?: string;
  }
}

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let JWT_KEY = process.env.JWT_SECRET as string;
    let AuthService = new Token();

    let accessToken = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

    if (!accessToken) {
      res.status(401).json({ message: "Access token not found, please log in" });
      return
    }

    jwt.verify(accessToken, JWT_KEY, async (err: any, data:any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token, please log in again." });
      }

      if (!data) {
        return res.status(403).json({ message: "Invalid token structure." });
      }
      console.log("this is jwt data",data)
      // Extract userId and check user status
      const userId = data.userId;
      const user = await Student.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.status === -1) {
        console.log("user blocked ");
        return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
      }

      
      

      req.userId = userId;
      req.role = data.role;
      next();
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return
  }
};
