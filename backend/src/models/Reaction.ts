import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction extends Document {
    userId: mongoose.Types.ObjectId;
    articleId: mongoose.Types.ObjectId;
    type: 'w' | 'mid' | 'cooked' | 'cap';
    createdAt: Date;
}

const ReactionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'NewsArticle', required: true },
    type: { type: String, enum: ['w', 'mid', 'cooked', 'cap'], required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

// One reaction per user per article
ReactionSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const Reaction = mongoose.model<IReaction>('Reaction', ReactionSchema);
