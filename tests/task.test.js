const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, userTwoId, userTwo, setupDatabase, taskOne } = require('./fixtures/db')


//This function runs before ~each~ test case in this test suite
beforeEach(setupDatabase)

//Sending a test request to /tasks to create a new task for a user
test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "From the first tasks test"
        }).expect(201)

    //Assert the task created is not null
    //Assert the task's completed property is being set to false by default
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

//Sending a test request to /tasks to get all the tasks of a specific user
test('Should get all tasks for a user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //Response gets back an arrays of the tasks belongs to the user
    //Assert there are 2 tasks associated with this user
    const tasks = response.body
    expect(tasks.length).toEqual(2)
})

//Sending a test request to /tasks/:id to delete tasks
test('Should not delete task for unauthorized user', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    //Assert that the first task is still in the database and has not been deleted
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

//Sending a test request to /tasks with invalid data expecting it to fail
test('Should not create task with invalid description/completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        }).expect(400)
})

//Sending a test request to /tasks/:id with invalid data expecting it to fail
test('Should not update task with invalid description/completed', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: undefined
        }).expect(200)
        
        //Assert the tasks complete propety wasnt changed
        const task = await Task.findById(taskOne._id)
       expect(task.completed).not.toBe(undefined)
})
    
//Sending a test request to /tasks/:id deleting a user task
test('Should delete user task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200)
        
        //Assert user task was deleted
        const task = await Task.findById(taskOne._id)
        expect(task).toBe(null)
})
    
//Sending a test request to /tasks/:id not deleting an unauthenticated request
test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401) 
})

//Sending a test request to /tasks/:id not updating unauthenticated request
test('Should not update other users task', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: 'test'
        })
        .expect(404)
})

//Sending a test request to /tasks/:id getting user's task by id
test('Should fetch user task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

//Sending a test request to /tasks/:id not getting user's task by id if unauthenticated
test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

//Sending a test request to /tasks/:id not getting user's task by id if unauthenticated
test('Should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

//Sending a test request to /tasks fetching only completed tasks
test('Shoud fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //Assert only completed tasks were fetched
    const tasks = response.body.filter(task => task.completed == true)
    expect(tasks[0]).toMatchObject({
        completed: true
    })
})

//Sending a test request to /tasks fetching only incompleted tasks
test('Should fetch only incompleted tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //Assert only incompleted tasks were fetched
    const tasks = response.body.filter(task => task.completed == false)
    expect(tasks[0]).toMatchObject({
        completed: false
    })
})

//Sending a test request to /tasks sorting tasks by description/completed/createdAt/updatedAt
test('Should sort tasks by description/completed/createdAt/updatedAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=createdAt')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //Assert tasks were sorted by the time of creation
    const tasks = response.body
    expect(tasks[0].description).toBe('Second Task')
})

//Sending a test request to /tasks fetching a page of tasks
test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get('/tasks?limit=8')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //Assert only 8 tasks were fetch for a page of tasks
    const tasks = response.body
    expect(tasks.length).toBeLessThanOrEqual(8)
})