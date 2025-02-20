import { TutorType } from "../../model/tutor/tutorModel"
import { OTPType } from "../../model/otp/ otpModel"

interface ITutorService{
    findByEmail(email:string):Promise<TutorType | null>
    createUser(username:string, email:string, password:string):Promise<TutorType | null>
    updateUser(email:string, data:TutorType):Promise<TutorType | null>
    storeUserOtp(email:string, otp:string):Promise<OTPType | null> 
    getOtpByEmail(email:string):Promise<OTPType | null>
    storeUserResendOtp(email:string, otp:string):Promise<OTPType | null> 
    loginUser(email:string,password:string):Promise<TutorType | null>
}

export default ITutorService