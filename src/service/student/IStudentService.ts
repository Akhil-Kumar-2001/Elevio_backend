import { OTPType } from "../../model/otp/ otpModel";
import { StudentType } from "../../model/student/studentModel";

interface IStudentService {
    findByEmail(email:string):Promise<StudentType | null>
    createUser(username:string, email:string, password:string):Promise<StudentType | null>
    updateUser(email:string, data:StudentType):Promise<StudentType | null>
    storeUserOtp(email:string, otp:string):Promise<OTPType | null> 
    getOtpByEmail(email:string):Promise<OTPType | null>
    storeUserResendOtp(email:string, otp:string):Promise<OTPType | null> 
    loginUser(email:string,password:string):Promise<StudentType | null>
    isBlocked(_id:string):Promise<number | undefined>

}

export default IStudentService; 