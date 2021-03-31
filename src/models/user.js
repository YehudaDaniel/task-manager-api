const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//The User schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot be as follow: "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true 
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}
userSchema.methods.toJSON = function() {
    const user = this
     const userObject = user.toObject()

     delete userObject.password
     delete userObject.tokens
     delete userObject.avatar

     return userObject
}

userSchema.statics.findByCred = async (email, password) => {
    const user = await User.findOne({email})
    if(!user)
        throw Error('Unable to log in.')
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
        throw Error('Unable to log in.')

    return user
}

//Taking advantage of Middleware(Schema.pre - before an event has occured, Schema.post - after an event has occured)
userSchema.pre('save', async function(next){
    //this. would be the document being saved
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Delete user tasks when a user is being removed
userSchema.pre('remove', async function(next){
    const user = this

    await Task.deleteMany({ owner: user._id })

    next()
})

//The User model defined
//required: name, email, password
const User = mongoose.model('User', userSchema)

module.exports = User