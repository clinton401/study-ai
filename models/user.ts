import  { Document, Schema, model, models, Types } from "mongoose";
import { hashPassword } from "@/lib/password-utils";
export interface IUser {
  email: string;
  name: string;
  password?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FullUser = IUser & {
  _id: Types.ObjectId
}
const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address",
    ],
  },
  name: {
    type: String,
    required: true,
    set: (value: string) => {
      if (!value) return value;
      return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
    minlength: [3, "Name must be at least 3 characters long"],
    
  },
  password: {
    type: String,
    required: false,
    validate: {
      validator: function(value: string) {
        if (value === "") return true;
        return value.length >= 6;
      },
      message: "Password must be at least 6 characters long",
    },
  },
  isVerified: {
    type: Boolean,
    required: false,
    default: false
  }

}, {
  timestamps: true, 
});

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      try {
        const password = this.password;
        if (password) {
          const hashedPassword = await hashPassword(password);
          this.password = hashedPassword;
        }
      } catch (err) {
        next(err as any);
        return;
      }
    }
    next();
  });

const User = models?.User || model<IUser>("User", UserSchema);

export default User;
