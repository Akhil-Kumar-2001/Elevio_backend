import Router from 'express';
import StudentRepository from '../../repository/student/implementation/StudentRepository';
import StudentService from '../../service/student/implementation/StudentService';
import StudentController from '../../controller/student/studentController';
import { validateToken } from '../../middleware/validateToken';
import { checkRole } from '../../middleware/checkRole';


const router = Router();
const studentRepository = new StudentRepository();
const studentService = new StudentService(studentRepository);
const studentController = new StudentController(studentService);

// sign-up routes

router.post('/signup',(req,res)=>studentController.signupPost(req,res));
router.post('/verify-otp',(req,res)=>studentController.verifyOtp(req,res));
router.post('/resend-otp',(req,res)=>studentController.resendOtp(req,res));

// sign-in routes

// router.post('/signin',(req,res)=> studentController.signinPost(req,res));
router.post('/signin',studentController.signinPost.bind(studentController));

router.post('/logout',(req,res)=>studentController.logout(req,res))

router.post('/refresh-token',(req,res)=>studentController.refreshToken(req,res));

// router.post('/is-Blocked',studentController.isBlocked.bind(studentController));
// router.post('/is-Blocked',validateToken)






export default router;