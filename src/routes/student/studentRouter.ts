import Router from 'express';
import StudentRepository from '../../repository/student/implementation/StudentRepository';
import StudentService from '../../service/student/implementation/StudentService';
import StudentController from '../../controller/student/implementation/StudentController';
import StudentCourseRepository from '../../repository/student/implementation/StudentCourseRepository';
import StudentCourseController from '../../controller/student/implementation/StudentCourseController';
import StudentCourseService from '../../service/student/implementation/StudentCourseService';
import IStudentCourseController from '../../controller/student/IStudentCourseController';
import IStudentController from '../../controller/student/IStudentController';


const router = Router();
const studentRepository = new StudentRepository();
const studentService = new StudentService(studentRepository);
const studentController:IStudentController = new StudentController(studentService);

const studentCourseRepository = new StudentCourseRepository();
const studentCourseService = new StudentCourseService(studentCourseRepository);
const studentCourseController:IStudentCourseController = new StudentCourseController(studentCourseService)

// sign-up routes

router.post('/signup', (req, res) => studentController.signupPost(req, res));
router.post('/verify-otp', (req, res) => studentController.verifyOtp(req, res));
router.post('/resend-otp', (req, res) => studentController.resendOtp(req, res));

// sign-in routes

router.post('/signin', studentController.signinPost.bind(studentController));
router.post('/logout', studentController.logout.bind(studentController));
router.post('/refresh-token',studentController.refreshToken.bind(studentController));
router.post('/refresh-token', (req, res) => studentController.refreshToken(req, res));

// Forgot password

router.post('/forgot-password', studentController.forgotPassword.bind(studentController));
router.post('/verify-forgot-otp', studentController.verifyForgotOtp.bind(studentController));
router.post('/reset-password', studentController.resetPassword.bind(studentController));

// Google Authentication 

router.post("/callback", studentController.googleAuth.bind(studentController));


router.get('/listed-courses',studentCourseController.getListedCourse.bind(studentCourseController));
// router.get("/auth/google/callback", studentController.googleAuthCallback.bind(studentController));


// router.post('/is-Blocked',studentController.isBlocked.bind(studentController));
// router.post('/is-Blocked',validateToken)






export default router;