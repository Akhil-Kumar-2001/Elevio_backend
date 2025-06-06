import { CourseData, IBasicStudentInfo, ILectureData, ISectionData } from "../../../Types/basicTypes";
import ITutorCourseRepository from "../ITutorCourseRepository";
import { Course, ICourse } from "../../../model/course/courseModel";
import { Category, ICategory } from "../../../model/category/categoryModel";
import { CourseResponseDataType, StudentsResponseDataType } from "../../../Types/CategoryReturnType";
import { ISection, Section } from "../../../model/section/sectionModel";
import { ILecture, Lecture } from "../../../model/lecture/lectureModel";
import s3 from '../../../Config/awsConfig'

import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { INotification, Notification } from "../../../model/notification/notification.Model";
import { IReview, Review } from "../../../model/review/review.model";
import { IStudent, Student } from "../../../model/student/studentModel";
import { Types } from "mongoose";
import { Tutor } from "../../../model/tutor/tutorModel";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class TutorCourseRepository implements ITutorCourseRepository {

    async getCategories(): Promise<ICategory[] | null> {
        const categories = await Category.find();
        return categories
    }

    async isTutorVerified(tutorId : string): Promise<boolean | null> {
        const tutor = await Tutor.findOne({ _id: tutorId });
        if (tutor?.isVerified  ==  "verified") {
            return true
        } else {
            return false
        }
    }

    async createCourse(courseData : CourseData): Promise<boolean | null> {
        try {
            const existingCourse = await Course.findOne({ title: courseData?.title });
            if ( existingCourse ) {
                return false
            } else {
                const newCourse = new Course(courseData);
                
                await newCourse.save();
                return true;
            }
        } catch (error) {
            console.error("Error creating course:", error);
            return null;
        }
    }

    async getCourses(tutorId: string, page: number, limit: number): Promise<CourseResponseDataType | null> {
        try {
            const skip = (page - 1) * limit;
            const courses = await Course.find({ tutorId }).sort({ createAt: -1 }).skip(skip).limit(limit).exec()
            const totalRecord = await Course.countDocuments()
            return { courses, totalRecord }
        } catch (error) {
            console.log("Error while retrieving courses")
            return null
        }
    }

    async getCourseDetails(id: string): Promise<ICourse | null> {
        try {
            const courseDetails = await Course.findById(id).populate('category', 'name');
            return courseDetails
        } catch (error) {
            console.log("Error while retrieving course details")
            return null
        }
    }

    async editCourse(id: string, editCourse: ICourse): Promise<ICourse | null> {
        try {
            const updatedCourse = await Course.findByIdAndUpdate(
                id,
                { $set: editCourse },
                { new: true }
            );
            return updatedCourse
        } catch (error) {
            console.log("Error while updating course details")
            return null
        }
    }

    async createSection(id: string, sectionData: ISectionData): Promise<ISection | null> {
        try {
            const course = await Course.findById(id);
            if (!course) {
                console.log("Course not found for ID:", id);
                return null;
            }

            const sectionCount = await Section.countDocuments({ courseId: id });

            const newSection = new Section({
                courseId: id,
                title: sectionData.title,
                description: sectionData.description,
                order: sectionCount + 1,
                totalLectures: 0,
                totalDuration: 0,
                isPublished: false,
            });

            await newSection.save();

            course.totalSections = (course.totalSections ?? 0) + 1;
            await course.save();

            return newSection;
        } catch (error) {
            console.log("Error while creating section:", error);
            return null;
        }
    }


    async createLecture(data: ILectureData): Promise<ILecture | null> {
        try {
            const { title, courseId, sectionId } = data;

            // Check if the course and section exist
            const course = await Course.findById(courseId);
            if (!course) {
                console.log("Course not found");
                return null;
            }

            const sectionExists = await Section.findById(sectionId);
            if (!sectionExists) {
                console.log("Section not found");
                return null;
            }

            // Get the current number of lectures in the section to determine the order
            const lectureCount = await Lecture.countDocuments({ sectionId });

            // Create new lecture
            const newLecture = new Lecture({
                sectionId,
                courseId,
                title,
                videoUrl: "", // Placeholder; should be provided when video is uploaded
                duration: 0, // Default value; update once video is processed
                order: lectureCount + 1, // Order based on existing lectures
                status: "processing",
                isPreview: false,
            });

            await newLecture.save();

            // Update section's total lectures count
            await Section.findByIdAndUpdate(sectionId, {
                $inc: { totalLectures: 1 },
            });

            course.totalLectures = (course.totalLectures ?? 0) + 1
            course.save()

            return newLecture;
        } catch (error) {
            console.error("Error while creating lecture:", error);
            return null;
        }
    }

    async getSections(id: string): Promise<ISection[] | null> {
        try {
            const sections = await Section.find({ courseId: id })
            return sections
        } catch (error) {
            console.log("Error while retrieving Sections ");
            return null
        }
    }

    async getLectures(id: string): Promise<ILecture[] | null> {
        try {
            const lectures = await Lecture.find({ sectionId: id })
            return lectures
        } catch (error) {
            console.log("Error while retrieving Sections ");
            return null
        }
    }

    async editLecture(id: string, title: string): Promise<ILecture | null> {
        try {
            const updatedLecture = await Lecture.findByIdAndUpdate(
                id,
                { title },
                { new: true }
            );
            return updatedLecture;
        } catch (error) {
            console.log("Error updating lecture:", error);
            return null;
        }
    }

    async deleteLecture(id: string): Promise<boolean | null> {
        try {
            // Find the lecture to get section and course IDs
            const deletedLecture = await Lecture.findByIdAndDelete(id);
            if (!deletedLecture) {
                console.log("Lecture not found for ID:", id);
                return false;
            }

            const { sectionId, courseId, duration } = deletedLecture;

            // Update totalLectures and totalDuration in the section
            const section = await Section.findById(sectionId);
            if (section) {
                section.totalLectures = Math.max((section.totalLectures ?? 0) - 1, 0);
                section.totalDuration = Math.max((section.totalDuration ?? 0) - duration, 0);
                await section.save();
            }

            // Update totalLectures and totalDuration in the course
            const course = await Course.findById(courseId);
            if (course) {
                course.totalLectures = Math.max((course.totalLectures ?? 0) - 1, 0);
                course.totalDuration = Math.max((course.totalDuration ?? 0) - duration, 0);
                await course.save();
            }

            return true;
        } catch (error) {
            console.log("Error deleting lecture:", error);
            return null;
        }
    }


    async editSection(id: string, data: ISectionData): Promise<ISection | null> {
        try {
            console.log("reached here")
            const updatedSection = await Section.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true }
            );
            console.log(updatedSection)
            return updatedSection;
        } catch (error) {
            console.log("Error updating section:", error);
            return null;
        }
    }

    // async uploadLectureVideo(lectureId: string, videoFile: Express.Multer.File): Promise<string | null> {
    //     const fileName = `${lectureId}-${Date.now()}-${videoFile.originalname}`;
    //     const params = {
    //         Bucket: process.env.AWS_S3_BUCKET_NAME || 'your-bucket-name',
    //         Key: `lectures/${fileName}`,
    //         Body: videoFile.buffer,
    //         ContentType: videoFile.mimetype,
    //         // Remove ACL: 'public-read'
    //     };

    //     try {
    //         // Upload to S3
    //         const uploadResult = await s3.upload(params).promise();
    //         const videoUrl = uploadResult.Location;

    //         // Update lecture in the database
    //         const updatedLecture = await Lecture.findByIdAndUpdate(
    //             lectureId,
    //             { videoUrl, status: 'completed' },
    //             { new: true }
    //         );

    //         if (!updatedLecture) {
    //             throw new Error('Lecture not found');
    //         }

    //         return videoUrl;
    //     } catch (error) {
    //         console.error('Error uploading video to S3:', error);
    //         return null;
    //     }
    // }

    async getVideoDuration(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata.format.duration || 0);
                }
            });
        });
    }

    async uploadLectureVideo(lectureId: string, videoFile: Express.Multer.File): Promise<string | null> {
        const fileName = `${lectureId}-${Date.now()}-${videoFile.originalname}`;
        const filePath = `/tmp/${fileName}`; // Temporary storage

        try {
            // Save the file temporarily
            await fs.promises.writeFile(filePath, videoFile.buffer);

            // Get video duration
            const duration = Math.round(await this.getVideoDuration(filePath));

            // Upload video to S3
            const uploadResult = await s3.upload({
                Bucket: process.env.AWS_S3_BUCKET_NAME || "your-bucket-name",
                Key: `lectures/${fileName}`,
                Body: videoFile.buffer,
                ContentType: videoFile.mimetype,
            }).promise();


            const videoUrl = uploadResult.Location;

            // Find the lecture
            const lecture = await Lecture.findById(lectureId);
            if (!lecture) throw new Error("Lecture not found");

            const { sectionId, courseId } = lecture;

            // Update the lecture with the video URL and duration
            const updatedLecture = await Lecture.findByIdAndUpdate(
                lectureId,
                { videoUrl, duration, status: "processed" },
                { new: true }
            );

            if (!updatedLecture) throw new Error("Failed to update lecture");

            // Update the total duration of the section
            await Section.findByIdAndUpdate(
                sectionId,
                { $inc: { totalDuration: duration } }
            );

            // Update the total duration of the course
            await Course.findByIdAndUpdate(
                courseId,
                { $inc: { totalDuration: duration } }
            );

            // Remove the temporary file
            await fs.promises.unlink(filePath);

            return videoUrl;
        } catch (error) {
            console.error("Error processing video:", error);
            return null;
        }
    }

    async applyReview(courseId: string): Promise<boolean | null> {
        try {
            const updatedCourse = await Course.findByIdAndUpdate(
                courseId,
                { status: "pending" },
                { new: true }
            );
            if (!updatedCourse) {
                return null;
            }
            return true;
        } catch (error) {
            console.log("Error updating course status:", error);
            return null;
        }
    }

    async getNotifications(receiverId: string): Promise<INotification[] | null> {
        try {
            const notifications = await Notification.find({ receiverId }).sort({ createdAt: -1 });
            return notifications;
        } catch (error) {
            console.log("Error fetching notifications:", error);
            return null;
        }
    }

    async readNotifications(id: string): Promise<boolean | null> {
        try {
            const notification = await Notification.findByIdAndUpdate(
                id,
                { isRead: true },
                { new: true }
            )
            console.log("notification after read", notification);
            return notification ? true : false
        } catch (error) {
            return null
        }
    }

    async getStudents(tutorId: string, page: number, limit: number): Promise<StudentsResponseDataType | null> {
        try {
            // Step 1: Get all courses by the tutor
            const courses = await Course.find({ tutorId }, "purchasedStudents");

            if (!courses.length) return { students: [], totalRecord: 0 };

            // Step 2: Extract all student IDs from the courses
            const allStudentIds = courses.flatMap(course => course.purchasedStudents || []);

            // Step 3: Deduplicate the IDs
            const uniqueStudentIds = Array.from(new Set(allStudentIds.map(id => id.toString())))
                .map(id => new Types.ObjectId(id));

            const totalRecord = uniqueStudentIds.length;

            // Step 4: Apply pagination
            const skip = (page - 1) * limit;

            const students = await Student.find(
                { _id: { $in: uniqueStudentIds }, status: 1 },
                "profilePicture username email role" // field projection
            )
                .skip(skip)
                .limit(limit);

            const formattedStudents: IBasicStudentInfo[] = students.map(student => ({
                profilePicture: student.profilePicture,
                username: student.username,
                email: student.email,
                role: student.role
            }));

            return {
                students: formattedStudents,
                totalRecord,
            };
        } catch (error) {
            console.error("Error while getting students:", error);
            return null;
        }
    }



    async getCoursePreview(courseId: string): Promise<ICourse | null> {
        try {
            const course = await Course.findOne({ _id: courseId })
                .populate('tutorId', 'username email profilePicture')
                .populate('category', 'name')
            return course
        } catch (error) {
            console.log("Error while getting Course details");
            return null
        }
    }


    async getSectionsPreview(courseId: string): Promise<ISection[] | null> {
        try {
            const sections = await Section.find({ courseId })
            return sections
        } catch (error) {
            console.log("Error while getting Sections");
            return null
        }
    }

    async getLecturesPreview(sectionId: string): Promise<ILecture[] | null> {
        try {
            const lectures = await Lecture.find({ sectionId: sectionId })
            return lectures
        } catch (error) {
            console.log("Error while retrieving Sections ");
            return null
        }
    }

    async getReviews(courseId: string): Promise<IReview[] | null> {
        try {
            const reviews = await Review.find({ courseId, isVisible: true })
                .populate('userId', 'username')
                .sort({ createdAt: -1 });
            return reviews.length > 0 ? reviews : null;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return null;
        }
    }

    async replyReview(reviewId: string, reply: string): Promise<IReview | null> {
        try {
            const updatedReview = await Review.findByIdAndUpdate(
                { _id: reviewId },
                { reply },
                { new: true }
            );
            return updatedReview ?? null;
        } catch (error) {
            console.error('Error replying to review:', error);
            return null;
        }
    }


    async deleteReply(reviewId: string): Promise<boolean | null> {
        try {
            const result = await Review.findByIdAndUpdate(
                reviewId,
                { $set: { reply: null } },
                { new: true }
            );

            if (!result) {
                console.error('Review not found for ID:', reviewId);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting reply:', error);
            return null;

        }
    }





}

export default TutorCourseRepository;
