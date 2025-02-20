import { TutorType } from "../../model/tutor/tutorModel"
import { OTPType } from "../../model/otp/ otpModel"

interface ITutorRepository{
    findByEmail(email:string):Promise<TutorType | null>
    createUser(username:string,email:string,password:string):Promise<TutorType | null>
    updateUserByEmail(email:string, data:TutorType):Promise<TutorType | null> 
    storeOtpInDb(email:string, otp:string):Promise<OTPType | null>
    findOtpByemail(email:string):Promise<OTPType | null>
    storeResendOtpInDb(email:string, otp:string):Promise<OTPType | null>
    loginUser(email:string, password:string): Promise<TutorType | null>

}

export default ITutorRepository