import Router from 'express';
import StudentRepository from '../../repository/student/implementation/StudentRepository';
import StudentService from '../../service/student/implementation/StudentService';
import StudentController from '../../controller/student/studentController';


const router = Router();
const studentRepository = new StudentRepository();
const studentService = new StudentService(studentRepository);
const studentController = new StudentController(studentService);

router.post('/signup',(req,res)=>studentController.signupPost(req,res));
router.post('/verify-otp',(req,res)=>studentController.verifyOtp(req,res));
router.post('/resend-otp',(req,res)=>studentController.resendOtp(req,res));





export default router;