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

}
export default StudentService;