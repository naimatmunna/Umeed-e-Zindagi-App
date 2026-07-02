import mongoose from 'mongoose';

const { Schema } = mongoose;

export const PAYMENT_METHODS = Object.freeze([
  'cash',
  'card',
  'bank',
  'mobile_wallet',
  'other',
]);

const expenseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, maxlength: 500 },
    date: { type: Date, required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'cash' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.categoryId && typeof ret.categoryId === 'object' && ret.categoryId.slug) {
          ret.category = {
            id: ret.categoryId.id ?? ret.categoryId._id?.toString(),
            name: ret.categoryId.name,
            slug: ret.categoryId.slug,
            color: ret.categoryId.color,
            icon: ret.categoryId.icon,
          };
          ret.categoryId = ret.category.id;
        }
        if (ret.userId && typeof ret.userId === 'object' && ret.userId.email) {
          ret.user = {
            id: ret.userId.id ?? ret.userId._id?.toString(),
            firstName: ret.userId.firstName,
            lastName: ret.userId.lastName,
            email: ret.userId.email,
          };
          ret.userId = ret.user.id;
        }
        return ret;
      },
    },
  },
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ date: -1, categoryId: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
