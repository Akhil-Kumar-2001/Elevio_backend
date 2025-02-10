import IAdminRepository from "../../../repository/admin/IAdminRepository";
import IAdminService from "../IAdminService";

class AdminService implements IAdminService{

    private _adminRepository:IAdminRepository;
    
    constructor(adminRepository:IAdminRepository) {
        this._adminRepository = adminRepository;

    }
}

export default AdminService;