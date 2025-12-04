const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectRequestSchema = new Schema({
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: "User", // reference to User model
        required: true
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: "User", // reference to User model
        required: true
    },
    status: {
        type: String, enum: {
            values: ['ignored', 'interested', 'accepted', "rejected"],
            message: `{VALUE} is not supported`
        },
        required: true,
    }

}, { timestamps: true });

connectRequestSchema.pre('save', function () {
    if (this.fromUserId.toString() === this.toUserId.toString()) {
        throw new Error("Cannot send connection request to oneself");
    }
});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectRequestSchema);
module.exports = ConnectionRequest;