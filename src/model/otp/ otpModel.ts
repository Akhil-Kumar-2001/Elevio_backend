import { Schema, Document, model } from "mongoose";

interface OTPType extends Document {
    email: string;
    otp: string;
    createdAt?: Date; // This will be used for TTL index
}

const otpSchema = new Schema<OTPType>({
    email: {
        type: String,
        required: true,
        index: true, // Improves lookup performance
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // TTL: Deletes document after 5 minutes
    },
}, { timestamps: true });

const OTP = model<OTPType>("OTP", otpSchema);

export { OTP, OTPType };
