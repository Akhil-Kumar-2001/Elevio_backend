import ITutorService from "../../service/tutor/ITutorService";
import { Request,Response } from "express";
import PasswordUtils from "../../utils/passwordUtility";
import MailUtility from "../../utils/mailUtility";
import OtpUtility from "../../utils/otpUtility";
import { TutorType } from "../../model/tutor/tutorModel";
import { Token } from "../../utils/tokenUtility";
import jwt from 'jsonwebtoken'

class TutorController {
    private _tutorService:ITutorService

    constructor(tutorService:ITutorService){
        this._tutorService = tutorService
    }

    async signupPost(req: Request, res: Response): Promise<void> {
        try {
            let { username, email, password } = req.body;

            if (!username || !email || !password) {
                res
                    .status(400)
                    .json({ message: "Username, Email and Password is Required" });
                return;
            }
            const existingUser = await this._tutorService.findByEmail(email);
            console.log("this is existing user", existingUser)
            if (existingUser) {
                if (existingUser.status === 0) {
                    password = await PasswordUtils.passwordHash(password);
                    const updatedUser = await this._tutorService.updateUser(email,{
                        username,
                        password,
                    } as TutorType);

                    const otp = (await OtpUtility.otpGenerator()).toString();

                    const oldOtp = await this._tutorService.getOtpByEmail(email);

                    if (oldOtp) {
                        await this._tutorService.storeUserResendOtp(email, otp)
                    } else {
                        await this._tutorService.storeUserOtp(email, otp);
                    }


                    try {
                        await MailUtility.sendMail(email, otp, "Verification otp");

                        res.status(200).json({
                            message: "Otp sent to the mail",
                            email,
                        });
                    } catch (error) {
                        console.error("Failed to send otp", error);
                        res
                            .status(500)
                            .json({ message: "Failed to send the verification mail." });
                    }
                    return;
                }
                else {
                    res.status(409).json({ message: "User already exist." });
                    return;
                }
            }
            password = await PasswordUtils.passwordHash(password);
            const newUser = await this._tutorService.createUser(
                username,
                email,
                password
            );

            const otp = (await OtpUtility.otpGenerator()).toString();

            const oldOtp = await this._tutorService.getOtpByEmail(email);

            if (oldOtp) {
                await this._tutorService.storeUserResendOtp(email, otp)
            } else {
                await this._tutorService.storeUserOtp(email, otp);
            }

            try {
                await MailUtility.sendMail(email, otp, "Verification otp");
                res.status(200).json({
                    message: "Otp sent to the given mail id",
                    email,
                    otp,
                });
            } catch (error) {
                console.error("Failed to send otp", error);
                res
                    .status(500)
                    .json({ message: "Failed to send the verification mail" });
            }
        } catch (error) {
            console.error("Error during signup:", error);
            res.status(500).json({ message: `Error while adding user: ${error}` });
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        const { otp, email } = req.body;
        if (!otp) {
            res.status(400).json({ message: "Otp is required" });
            return;
        }
        if (!otp || !email) {
            res.status(400).json({ message: "OTP Timeout. Try again" });
            return;
        }

        const response = await this._tutorService.getOtpByEmail(email);

        const storedOtp = response?.otp;

        if (storedOtp === otp) {
            let currentUser = await this._tutorService.findByEmail(email);
            if (!currentUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const userData: TutorType = { ...currentUser.toObject(), status: 1 };

            const updatedUser = await this._tutorService.updateUser(
                email,
                userData
            );

            if (updatedUser) {
                res.status(200).json({
                    message: "Otp Verified Successfully",
                });
            } else {
                res.status(500).json({
                    message: "Error while updating user data",
                });
            }
        } else {
            res.status(400).json({
                message: "Incorrect otp Please try again later",
            });
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {

        const { email } = req.body;

        const otp = (await OtpUtility.otpGenerator()).toString();
        await this._tutorService.storeUserResendOtp(email, otp)

        try {
            await MailUtility.sendMail(email, otp, "Verification otp");
            res.status(200).json({
                message: "Otp sent to the given mail id",
                email,
                otp,
            });
        } catch (error) {
            console.error("Failed to send otp", error);
            res
                .status(500)
                .json({ message: "Failed to send the verification mail" });
        }
    }

    async signinPost(req: Request, res: Response): Promise<void> {
        try {

            // check email and password valid
            // check existing user or not if not tell to signup
            // if it is existing user check the user is blocked or not
            // then compare the password
            // if password correct create access and refresh token
            // store those token in cookie

            const { email, password } = req.body;

            if (!email || !password) {
                res
                    .status(400)
                    .json({
                        success: false,
                        message: "Email and password required",
                        data: null
                    })
            }

            const user = await this._tutorService.findByEmail(email);

            if (!user) {
                res
                    .status(404)
                    .json({
                        success: false,
                        message: "User not found Signup first to login",
                        data: null
                    })
                return
            }

            if (!user?.status) {
                res
                    .status(403)
                    .json({
                        success: false,
                        message: "Your Account is Blocked",
                        data: null
                    })
                return
            }
            if (!user.password) {
                res
                    .status(404)
                    .json({
                        success: false,
                        message: "Password is not set for this account",
                        data: null
                    })
                return
            }
            const comparePassword = await PasswordUtils.comparePassword(password, user?.password)

            if (!comparePassword) {
                res
                    .status(401)
                    .json({
                        success: false,
                        message: "Invalid email or password",
                        data: null,
                    });
                return;
            }


            if (user?.id) {
                const tokenInstance = new Token();
                const { accessToken, refreshToken } = tokenInstance.generatingTokens(user.id, user.role);
                console.log("Accesstoken : ", accessToken)
                console.log("Refreshtoken : ", refreshToken)
                const filteredData = {
                    id: user._id,
                    role: user.role,
                };
                if (accessToken && refreshToken) {
                    res.cookie("refreshToken", refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: 24 * 60 * 60 * 1000,
                    });
                    res.cookie("accessToken", accessToken, {
                        httpOnly: false,
                        secure: true,
                        sameSite: "none",
                        maxAge: 15 * 60 * 1000,
                    });
                    res
                        .status(200)
                        .json({
                            successs: true,
                            message: "Sign-in successful",
                            data: { accessToken,user: filteredData }
                        });
                    return
                } else {
                    res.status(401).json({
                        success: false,
                        message: "Invalid credentials"
                    });
                    return;
                }
            } else {
                res
                    .status(401)
                    .json({
                        success: false,
                        message: "Invalid Credentials"
                    });
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ success: false, message: 'Refresh token missing' });
                return
            }

            // **Verify the refresh token**
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err: any, decoded: any) => {
                if (err) {
                    return res.status(403).json({ success: false, message: 'Invalid refresh token' });
                }

                // Generate a new access token
                const tokenInstance = new Token();
                const newAccessToken = tokenInstance.generatingTokens(decoded.userId, decoded.role).accessToken;

                res.status(200).json({ success: true, accessToken: newAccessToken });
            });
        } catch (error) {
            console.error('Error refreshing token:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
    async logout(req:Request,res:Response):Promise<void> {

        try {
            res.clearCookie("accessToken", {
              httpOnly: true,
              secure: true,
              sameSite: "none",
            });
            res.clearCookie("refreshToken", {
              httpOnly: true,
              secure: true,
              sameSite: "none",
            });
            res.status(200).json({
              success: true,
              message: "Logout successful",
            });
            return 
          } catch (error) {
            console.error("Logout error:", error);
            res.status(400).json({  error: "logout failed"});
            return 
          }
    }

}

export default TutorController