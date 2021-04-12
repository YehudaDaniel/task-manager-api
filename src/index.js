const app = require('./app')

const PORT = process.env.PORT

//Listening to the PORT constant value, either predefined port or a environment port.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
