import { StudentType } from "../../model/student/studentModel";

interface IStudentService {
    findByEmail(email:string):Promise<StudentType | null>
    createUser(username:string, email:string, password:string):Promise<StudentType | null>
}

export default IStudentService; 