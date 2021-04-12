const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

//tells express to parse the json data coming into an object and be accessable via req.body.
app.use(express.json())
//Includes the user router and uses its router requests.
app.use(userRouter)
//Includes the task router and uses its router requests.
app.use(taskRouter)
//-----------------------------------------

module.exports = app