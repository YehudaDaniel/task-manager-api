const mongoose = require('mongoose')

//The Task Schema
const taskSchema = mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})


//The Task model defined
// required: description
const Task = mongoose.model('Task', taskSchema)

module.exports = Task