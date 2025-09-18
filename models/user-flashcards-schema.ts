import { Schema, models, model, Types } from "mongoose";

export interface Flashcard {
  id: number;
  front: string;  // Question or term
  back: string;   // Answer or definition
}

export interface UserFlashcardsDoc  {
  userId: string;
  flashcards: Flashcard[];
  originalText: string;
  count: number;
  createdAt: Date;
}
export type FullUserFlashcard = UserFlashcardsDoc & {
  _id: Types.ObjectId
}
const FlashcardSchema = new Schema<Flashcard>(
  {
    id: { type: Number, required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
  },
  { _id: false }
);

const UserFlashcardsSchema = new Schema<UserFlashcardsDoc>({
  userId: { type: String, required: true, ref: "User" },
  flashcards: { type: [FlashcardSchema], required: true },
  originalText: { type: String, required: true },
  count: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserFlashcards =
  models.UserFlashcards ||
  model<UserFlashcardsDoc>("UserFlashcards", UserFlashcardsSchema);

export default UserFlashcards;
