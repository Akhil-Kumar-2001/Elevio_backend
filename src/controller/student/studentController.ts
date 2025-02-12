    import IStudentService from "../../service/student/IStudentService";
    import { Request, Response } from "express";
    import OtpUtility from "../../utils/otpUtility";
    import MailUtility from "../../utils/mailUtility";
    import PasswordUtils from "../../utils/passwordUtility";
    import { StudentType } from "../../model/student/studentModel";

    class StudentController {
        private _studentService: IStudentService;

        constructor(studentService: IStudentService) {
            this._studentService = studentService;
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
                const existingUser = await this._studentService.findByEmail(email);
                console.log("this is existing user",existingUser)
                if (existingUser) {
                    if (existingUser.status === 0) {
                        password = await PasswordUtils.passwordHash(password);
                        const updatedUser = await this._studentService.updateUser(email, {
                            username,
                            password,
                        } as StudentType);

                        const otp = (await OtpUtility.otpGenerator()).toString();

                        const oldOtp = await this._studentService.getOtpByEmail(email);

                        if(oldOtp){
                            await this._studentService.storeUserResendOtp( email,otp) 
                        }else{
                            await this._studentService.storeUserOtp(email, otp);
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
                const newUser = await this._studentService.createUser(
                    username,
                    email,
                    password
                );

                const otp = (await OtpUtility.otpGenerator()).toString();

                const oldOtp = await this._studentService.getOtpByEmail(email);

                        if(oldOtp){
                            await this._studentService.storeUserResendOtp( email,otp) 
                        }else{
                            await this._studentService.storeUserOtp(email, otp);
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

            const response = await this._studentService.getOtpByEmail(email);

            const storedOtp = response?.otp;

            if (storedOtp === otp) {
                let currentUser = await this._studentService.findByEmail(email);
                if (!currentUser) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }

                const userData: StudentType = { ...currentUser.toObject(), status: 1 };

                const updatedUser = await this._studentService.updateUser(
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

        async resendOtp(req:Request,res:Response):Promise<void> {

            const {email} = req.body;

            const otp = (await OtpUtility.otpGenerator()).toString();
            await this._studentService.storeUserResendOtp( email,otp)

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
    }

    export default StudentController;
