const mongoose = require('mongoose');

let messageSchema = mongoose.Schema({
    content: {
        type: mongoose.Schema.Types.String,
        require: true
    },
    answer: {
        type: mongoose.Schema.Types.String,
        require: true
    },
    author: {
        type: mongoose.Schema.Types.String,
        require: true
    },
    receiver: {
        type: mongoose.Schema.Types.String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

let Message = mongoose.model('Message', messageSchema);
module.exports = Message;