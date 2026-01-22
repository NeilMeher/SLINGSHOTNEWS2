import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    isValid: boolean;
}

const RefreshTokenSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-delete expired sessions from DB
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
