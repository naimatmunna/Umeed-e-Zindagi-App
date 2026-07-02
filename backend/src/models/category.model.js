import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    color: { type: String, default: '#007AFF', match: /^#[0-9A-Fa-f]{6}$/ },
    icon: { type: String, trim: true, maxlength: 32, default: 'tag' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
