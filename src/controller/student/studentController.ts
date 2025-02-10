import IStudentService from "../../service/student/IStudentService";
import { Request,Response } from "express";
import OtpUtility from "../../utils/otpUtility";
import MailUtility from "../../utils/mailUtility";
import PasswordUtils from "../../utils/passwordUtility";

class StudentController {

    private _studentService: IStudentService;

    constructor(studentService: IStudentService) {
        this._studentService = studentService;

    }
    
    async signupPost(req:Request,res:Response):Promise<void>{
        try {
            let {username,email,password} = req.body;

            if(!username || !email || !password){
                res.status(400).json({message:"Username, Email and Password is Required"});
                return;
            }
            const existingUser = await this._studentService.findByEmail(email)

            if(existingUser){
                if(existingUser.status === 0){
                    const otp = await OtpUtility.otpGenerator();
                    try {
                        await MailUtility.sendMail(email, otp, "Verification otp");

                        res.status(200)
                           .json({
                            message:"Otp sent to the mail",
                            email,
                            otp,
                           })                            

                    } catch (error) {
                        console.error("Failed to send otp", error);
                        res
                            .status(500)
                            .json({message:"Failed to send the verification mail."});

                    }
                    return;
                }
                else{
                    res.status(409).json({message:"User already exist."});
                    return;
                }

            }

            password = await PasswordUtils.passwordHash(password);
            const newUser = await this._studentService.createUser(username,email,password);

            const otp = await OtpUtility.otpGenerator();
            try {
                await MailUtility.sendMail(email,otp, "Verification otp");
                res
                    .status(200)
                    .json({
                        message:"Otp sent to the given mail id",
                        email,
                        otp
                    })
            } catch (error) {
                console.error("Failed to send otp",error);
                res
                    .status(500)
                    .json({message:"Failed to send the verification mail"});

            }


        } catch (error) {
            console.error("Error during signup:", error);
      res
        .status(500)
        .json({ message: `Error while adding user: ${error}` });
    }
        }
    }



export default StudentController;