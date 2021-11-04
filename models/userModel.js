const crypto = require('crypto');
const mongoose = require('mongoose');

const crypt = require('bcryptjs');
const Product = require('./productModel');
const Category = require('./ReportModel');
const Report = require('./ReportModel');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'first name name must not be empty'],
    minlength: [3, 'first name name must be more then 3 characters'],
    maxLength: [50, 'first name name must be more then 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'last name must not be empty'],
    minlength: [3, 'last name must be more then 3 characters'],
    maxLength: [50, 'last name must be more then 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'email must not be empty'],
    unique: [
      true,
      'email already used , please try with on other email or login',
    ],
    validate: {
      validator: function (val) {
        return val.match(
          /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/
        );
      },
      message: (props) => {
        return `${props.value} is not a valid Email,  please try again !`;
      },
    },
  },
  phoneNumber: {
    type: String,
    required: [true, 'phone number must not be empty'],
    unique: [
      true,
      'Phone number already used , please try with on other phone number or login',
    ],
    validate: {
      validator: function (val) {
        return val.match(/^(0)(5|6|7)[0-9]{8}$/);
      },
      message: (props) => {
        return `${props.value} is not a valid phone number ,  please try again !`;
      },
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
    required: [true, 'password  must not be empty'],
  },
  passwordConfirm: {
    type: String,

    required: [true, 'password confirmation must not be empty'],
    validate: {
      //Work only on Save or Create
      validator: function (prop) {
        return prop === this.password;
      },
      message: 'passwords are not equale',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpired: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await crypt.hash(this.password, 12);
  //Delete passowrdConfirm prop
  this.passwordConfirm = undefined;

  next();
});
// Change passwordChangedAt when modifying he password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre('save', function (next) {
  this.avatar = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${this.firstName}+${this.lastName}`;
  this.email = this.email.toLowerCase();
  this.firstName = this.firstName.toLowerCase();
  this.lastName = this.lastName.toLowerCase();
  next();
});

userSchema.pre('deleteOne', function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.

  Product.deleteMany({ user: this._id }).exec();
  Product.deleteMany({ buyer: this._id }).exec();
  Category.deleteMany({ user: this._id }).exec();
  Report.deleteMany({ user: this._id }).exec();
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// instance method (a method that is avaliable in all instances)
// password check when login
userSchema.methods.verifyPassword = async function (
  condidtatePassword,
  userPassword
) {
  return await crypt.compare(condidtatePassword, userPassword);
};

// check if jwt.iat > passwordChanged at

userSchema.methods.isPasswordchanged = function (jwtIat) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtIat < passwordChangedAtTimeStamp;
  }

  return false;
};

// Create reset passowrd token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpired = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.index({ email: 1 });
const User = mongoose.model('User', userSchema);

module.exports = User;
