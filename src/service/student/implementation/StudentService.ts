import { OTPType } from "../../../model/otp/ otpModel";
import { StudentType } from "../../../model/student/studentModel";
import IStudentRepository from "../../../repository/student/IStudentRepository";
import IStudentService from "../IStudentService";

class StudentService implements IStudentService {

    private _studentRepository: IStudentRepository;

    constructor(studentRepository: IStudentRepository) {
        this._studentRepository = studentRepository;
    }

    async findByEmail(email: string): Promise<StudentType | null> {
        const getUser = await this._studentRepository.findByEmail(email)
        return getUser
    }

    async createUser(username: string, email: string, password: string): Promise<StudentType | null> {
        const newUser = await this._studentRepository.createUser(username,email,password)
        return newUser;
    }
    async updateUser(email: string, data:StudentType): Promise<StudentType | null> {
        const updatedUser = await this._studentRepository.updateUserByEmail(email,data);
        return updatedUser
    }

    async storeUserOtp(email: string, otp: string): Promise<OTPType | null> {
        const storedOtp = await this._studentRepository.storeOtpInDb(email,otp);
        return storedOtp
    }
    
    async getOtpByEmail(email: string): Promise<OTPType | null> {
        const otp = await this._studentRepository.findOtpByemail(email)
        return otp
    }
    async storeUserResendOtp(email: string, otp: string): Promise<OTPType | null> {
        const storedOtp = await this._studentRepository.storeResendOtpInDb(email,otp);
        return storedOtp
    }

    async loginUser(email: string, password: string): Promise<StudentType | null> {
        const user = await this._studentRepository.loginUser(email,password);
        return user
    }

    async isBlocked(_id: string): Promise<number | undefined> {
        const user = await this._studentRepository.isBlocked(_id);
        return user
    }
    

}
export default StudentService;