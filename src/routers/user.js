const express = require('express')
// const { findById } = require('../models/user')
const auth = require('../middleware/auth.middleware')
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please provide a valid photo'))
        }

        cb(undefined, true)
    }
})
const router = express.Router()

//users endpoint for fetching data.
//Get requests.
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})
router.get('/users/:id/avatar', async(req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar)
            throw new Error('An error has occured')
        
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})
//Post requests.
router.post('/users', async (req, res) => { 
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e){
        res.status(400).send(e)
    }    
})
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCred(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }catch(e){
        res.status(400).send()
    }
})
router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send('Logged out successfully.')
    }catch(e){
        res.status(500).send()
    }
})
router.post('/users/logoutAll', auth, async (req, res) => {
    try { 
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch(ex) {
        res.status(500).send()
    }
})

//All avatar images would be in a PNG format and be resized to be 250X250
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

//Patch requests.
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }
    
    try{
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    }catch(e) {
        res.status(400).send(e)
    }
})
//Delete requests.
router.delete('/users/me', auth, async (req, res) => {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)  no need to check if the users exists since we used the auth func as the second position argument
        // if(!user)
        //     return res.status(404).send({error: 'A user with this id was not found'})
        
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


//Exporting the module
module.exports = router