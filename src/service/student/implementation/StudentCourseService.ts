import { ICourse } from "../../../model/course/courseModel";
import IStudentCourseRepository from "../../../repository/student/IStudentCourseRepository";
import IStudentCourseService from "../IStudentCourseService";

class StudentCourseService implements IStudentCourseService {
    private _studentCourseRepository: IStudentCourseRepository;

    constructor(studentCourseRepository: IStudentCourseRepository) {
        this._studentCourseRepository = studentCourseRepository;
    }

        async getListedCourse(): Promise<ICourse[] | null> {
            const courses = await this._studentCourseRepository.getListedCourse();
            return courses
        }
}

export default StudentCourseService