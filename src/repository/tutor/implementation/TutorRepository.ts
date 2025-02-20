import { Tutor, TutorType } from '../../../model/tutor/tutorModel';
import ITutorRepository from '../ITutorRepository'
import { OTP,OTPType } from '../../../model/otp/ otpModel';

class TutorRepository implements ITutorRepository{

    async findByEmail(email: string): Promise<TutorType | null> {
        const getUser = await Tutor.findOne({email :  email});
        return getUser;
    }

    async createUser(username: string, email: string, password: string): Promise<TutorType | null> {
        const newUser = await Tutor.create({username,email,password});
        return newUser;
    }

    async updateUserByEmail(email: string, data:TutorType): Promise<TutorType | null> {
        const updatedUser = await Tutor.findOneAndUpdate({ email }, data,{ new:true })
        return updatedUser
    }

    async storeOtpInDb(email: string, otp: string): Promise<OTPType | null> {
        const storedOtp = await OTP.create({email,otp})
        return storedOtp
    }

    async findOtpByemail(email: string): Promise<OTPType | null> {
        const otp = await OTP.findOne({email :  email});
        return otp;
    }

    async storeResendOtpInDb(email: string, otp: string): Promise<OTPType | null> {
        const storedOtp = await OTP.findOneAndUpdate({email},{otp},{new:true})
        return storedOtp
    }

    async loginUser(email:string, password:string): Promise<TutorType | null> {
        const user = await Tutor.findOne({email})
        return user
    }
}

export default TutorRepository;