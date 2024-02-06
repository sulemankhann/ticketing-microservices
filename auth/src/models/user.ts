import { Schema, model, Model, Document } from "mongoose";
import { Password } from "../utils/password";

// An interface that describe the properties
// that are required to crearte a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describe the properties
// that a User model has
interface UserModel extends Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a user have

interface UserDoc extends Document {
  email: string;
  password: string;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }

  done();
});
const User = model<UserDoc, UserModel>("User", userSchema);

export default User;
