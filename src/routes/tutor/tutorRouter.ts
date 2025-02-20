import Router from 'express';
import TutorRepository from '../../repository/tutor/implementation/TutorRepository';
import TutorService from '../../service/tutor/implementation/TutorService';
import TutorController from '../../controller/tutor/tutorController';



const router = Router();
const tutorRepository = new TutorRepository()
const tutorService = new TutorService(tutorRepository)
const tutorController = new TutorController(tutorService)


// sign-up routes

router.post('/signup',(req,res)=>tutorController.signupPost(req,res));
router.post('/verify-otp',(req,res)=>tutorController.verifyOtp(req,res));
router.post('/resend-otp',(req,res)=>tutorController.resendOtp(req,res));

// sign-in routes

router.post('/signin',(req,res)=>tutorController.signinPost(req,res));

router.post('/logout',(req,res)=>tutorController.logout(req,res))

router.post('/refresh-token',(req,res)=>tutorController.refreshToken(req,res));


export default  router