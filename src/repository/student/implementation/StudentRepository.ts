import IStudentRepository from "../IStudentRepository";
import { Student, StudentType } from "../../../model/student/studentModel";
import { OTP, OTPType } from "../../../model/otp/ otpModel";

class StudentRepository implements IStudentRepository {

    async findByEmail(email: string): Promise<StudentType | null> {
        const getUser = await Student.findOne({email :  email});
        return getUser;
    }

    async createUser(username: string, email: string, password: string): Promise<StudentType | null> {
        const newUser = await Student.create({username,email,password});
        return newUser;
    }

    async updateUserByEmail(email: string, data:StudentType): Promise<StudentType | null> {
        const updatedUser = await Student.findOneAndUpdate({ email }, data,{ new:true })
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

    async loginUser(email:string, password:string): Promise<StudentType | null> {
        const user = await Student.findOne({email})
        return user
    }

    async isBlocked(_id: string): Promise<number | undefined> {
        const user = await Student.findById({_id});
        return user?.status;
    }
}

export default StudentRepository;