const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UsersSchema = new Schema(
    {
        name               : { type: String },
        email              : { type: String, unique: true },
        password           : { type: String },
        confirmation_code  : { type: String },
        password_reset_code: { type: String },
        verified_at        : { type: Date, default: null }

    },
    {
        timestamps:true,
        versionKey:false
    }
);

module.exports = User = mongoose.model('User', UsersSchema);