import jwt from 'jsonwebtoken';
import { IToken } from '../Types/IToken';
import dotenv from 'dotenv';
dotenv.config();


export class Token implements IToken {
  
  private readonly JWT_Key: string = process.env.JWT_SECRET as string;
  private readonly refreshSecret: string =
    process.env.REFRESH_TOKEN_SECRET || " ";

  generatingTokens(userId: string, role: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jwt.sign(
      { userId, role },  // Adding role 
      this.JWT_Key,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId, role },  // Adding role 
      this.refreshSecret,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }
}

