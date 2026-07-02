import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    joiningDate: { type: Date, required: true, default: Date.now },
    salary: { type: Number, min: 0, default: 0 },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    avatar: { url: String, publicId: String },
    lastLoginAt: { type: Date },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    refreshTokenHashes: { type: [String], default: [], select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokenHashes;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerifyToken;
        delete ret.emailVerifyExpires;
        if (ret.roleId && typeof ret.roleId === 'object' && ret.roleId.slug) {
          ret.role = {
            id: ret.roleId.id ?? ret.roleId._id?.toString(),
            name: ret.roleId.name,
            slug: ret.roleId.slug,
            description: ret.roleId.description,
            isActive: ret.roleId.isActive,
          };
          ret.roleId = ret.role.id;
        }
        return ret;
      },
    },
  },
);

userSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
