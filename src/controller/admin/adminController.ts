import IAdminService from "../../service/admin/IAdminService"

class AdminController {

    private _adminService: IAdminService;

    constructor(adminService:IAdminService){
        this._adminService = adminService;
    }
}

export default AdminController