import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    displayName?: string;
    dateOfBirth: Date;
    region: 'US' | 'UK' | 'CA' | 'AU' | 'IN';
    interests: ('tech' | 'money' | 'world' | 'politics' | 'science' | 'health')[];
    onboardingCompleted: boolean;
    onboardingStep: number;
    role: 'user' | 'admin';
    isActive: boolean;
    lastLogin?: Date;
    bio?: string;
    phone?: string;
    avatar?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        website?: string;
    };
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        frequency: 'daily' | 'weekly' | 'none';
    };
    sessions?: {
        device: string;
        ip: string;
        lastActive: Date;
    }[];
    emailVerified: boolean;
    verificationToken?: string;
    verificationExpires?: Date;
    lastVerificationSent?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: 3,
        maxlength: 20,
        match: /^[a-z0-9_]+$/
    },
    displayName: { type: String },
    bio: { type: String, maxlength: 500 },
    phone: { type: String },
    avatar: { type: String },
    location: {
        city: { type: String },
        country: { type: String }
    },
    socialLinks: {
        twitter: { type: String },
        instagram: { type: String },
        website: { type: String }
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        frequency: { type: String, enum: ['daily', 'weekly', 'none'], default: 'daily' }
    },
    sessions: [{
        device: String,
        ip: String,
        lastActive: { type: Date, default: Date.now }
    }],
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    lastVerificationSent: { type: Date },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function (v: Date) {
                const age = new Date().getFullYear() - v.getFullYear();
                return age >= 13;
            },
            message: 'you must be at least 13 years old 💀',
        },
    },
    region: { type: String, enum: ['US', 'UK', 'CA', 'AU', 'IN'], default: 'US' },
    interests: [{ type: String, enum: ['tech', 'money', 'world', 'politics', 'science', 'health'] }],
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete (ret as any).password;
            return ret;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            delete (ret as any).password;
            return ret;
        }
    }
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Secure password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
