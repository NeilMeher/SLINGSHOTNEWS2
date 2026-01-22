import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
    userId: mongoose.Types.ObjectId;
    articleId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const BookmarkSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'NewsArticle', required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

// One bookmark per user per article
BookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
