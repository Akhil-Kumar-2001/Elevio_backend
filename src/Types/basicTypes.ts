export interface TutorVerificationFormData {
    _id:string;
    isVerified: "pending" | "approved" | "rejected"; 
    profile: {
      bio: string;
      documents: {
        fileUrl: string;
        type: "id_verification" | "experience_certificate" | string; 
      }[];
      experience: string;
      qualification: string;
      skills: string[];
    };
  }


  export interface CourseData {
    courseName: string;
    coursePrice: string;
    category: string;
    thumbnail: string;
    description: string;
  }
  