
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
    {
        type             : { type: String },
        mobile           : { type: String },
        address          : { type: String },
        company_name     : { type: String },
        age              : { type: Number, min: 18, max: 65 },
        occupation       : { type: String },
        experience       : { type: String },
        imagen           : { type: String },
        user             : { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = Profile = mongoose.model('Profile', ProfileSchema);