import Router from 'express';
import AdminRepository from '../../repository/admin/implementation/AdminRepository';
import AdminService from '../../service/admin/Implementation/AdminService';
import AdminController from '../../controller/admin/adminController';

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);



const router = Router();

export default router