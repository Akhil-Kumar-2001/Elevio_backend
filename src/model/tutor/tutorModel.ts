import { Schema, Types, Document, model } from "mongoose";

interface TutorType extends Document {
    username?: string;
    email?: string;
    password?: string;
    role: string;
    status?: number;
    isVerified: boolean;
    profile: {
        bio?: string;
        profilePicture?: string;
        qualification?: string;
        experience?: string;
        skills?: string[];
        documents?: {
            type: string;
            fileUrl: string;
        }[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const tutorSchema = new Schema<TutorType>({
    username: {
        type: String,
        required: true,
        message: "Name is required",
    },
    email: {
        type: String,
        required: true,
        unique: true,
        message: "Email is required",
    },
    password: {
        type: String,
        required: true,
        message: "Password is required",
    },
    role: {
        type: String,
        enum: ["Tutor"],
        default: "Tutor",
    },
    status: {
        type: Number,
        enum: [0, 1, -1],
        default: 0,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    profile: {
        bio: { type: String },
        profilePicture: { type: String },
        qualification: { type: String },
        experience: { type: String },
        skills: { type: [String], default: [] },
        documents: [
            {
                type: { type: String, required: true },
                fileUrl: { type: String, required: true },
            },
        ],
    },
}, { timestamps: true });

const Tutor = model<TutorType>("Tutor", tutorSchema);
export { Tutor, TutorType };
