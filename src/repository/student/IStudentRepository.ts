import { OTPType } from "../../model/otp/ otpModel";
import { StudentType } from "../../model/student/studentModel";

interface IStudentRepository  {

    findByEmail(email:string):Promise<StudentType | null>
    createUser(username:string,email:string,password:string):Promise<StudentType | null>
    updateUserByEmail(email:string, data:StudentType):Promise<StudentType | null>
    storeOtpInDb(email:string, otp:string):Promise<OTPType | null>
    findOtpByemail(email:string):Promise<OTPType | null>
    storeResendOtpInDb(email:string, otp:string):Promise<OTPType | null>
    loginUser(email:string, password:string): Promise<StudentType | null>
    isBlocked(_id:string):Promise<number | undefined>

}


export default IStudentRepository;