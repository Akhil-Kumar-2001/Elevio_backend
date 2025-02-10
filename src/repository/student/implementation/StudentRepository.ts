import IStudentRepository from "../IStudentRepository";
import { Student, StudentType } from "../../../model/student/studentModel";

class StudentRepository implements IStudentRepository {

    async findByEmail(email: string): Promise<StudentType | null> {
        const getUser = await Student.findOne({email :  email});
        return getUser;
    }

    async createUser(username: string, email: string, password: string): Promise<StudentType | null> {
        const newUser = await Student.create({username,email,password});
        return newUser;
    }
}

export default StudentRepository;