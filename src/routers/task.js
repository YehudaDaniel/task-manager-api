const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth.middleware')
const router = express.Router()

//tasks endpoint for fetching data.
//Post requests.
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(e)
    }
})
//Get requests.
//Get /tasks?completed=true/false
//Get /tasks?limit=10&skip=10 
// - limit will return only 10 result out of the hundreds we have
// - skip will return the number of result limited but started from a specific point
//GET /tasks?sortBy=createdAt_asc/desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = (parts[1] === 'asc')? 1 : -1
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send()
    }
}) 

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task)
            return res.status(404).send()
        res.status(200).send(task)
    } catch(e){
        res.status(500).send('Could not find task')
    }
})
//Patch requests.
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid update!'})
    }
    
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        console.log(task)
                
        if(!task){
            return res.status(404).send({error: 'Task was not found.'})
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})
//Delete requests.
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!task)
            return res.status(404).send({error: 'Task was not found.'})
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

//Exporting the module
module.exports = router