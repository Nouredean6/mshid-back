const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        validate: [
            validator.isAlphanumeric,
            "First Name can only have Alphanumeric values. No special characters allowed",
        ],
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
        validate: [
            validator.isAlphanumeric,
            "Last Name can only have Alphanumeric values. No special characters allowed",
        ],
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    googleID: String,
	photo: {
        type: String,
        // required: [true, "Please add a photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      password: {
        type: String,
        validate: [
            {
                validator: function(value) {
                    return value.length >= 8;
                },
                message: 'Password must be at least 8 characters long',
            },
        ],
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: "Passwords do not match",
        },
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    }
},
{
    timestamps: true,
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);

	this.passwordConfirm = undefined;
	next();
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password") || this.isNew) {
		return next();
	}
	next();
});

userSchema.methods.comparePassword = async function (givenPassword) {
	return await bcrypt.compare(givenPassword, this.password);
};


const User = mongoose.model('User', userSchema);
module.exports = User;