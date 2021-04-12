const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')


//This function runs before ~each~ test case in this test suite
beforeEach(setupDatabase)

//This function runs after ~each~ test case in this test suite
// afterEach(() => {
//     console.log('After Each')
// })

//Sending a test request to /users which signs up a new user and returns its data
test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'moshe',
            email: 'h5ytguf@gmail.com',
            password: 'Yehuda12'
        })
        .expect(201)

    //Assert that the database was changed correctly(fetching user from the database)
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response(response body)
    expect(response.body).toMatchObject({
        user: {
            name: "moshe",
            email: "h5ytguf@gmail.com",
        },
        token: user.tokens[0].token
    })

    //Expecting the password from the database to be encrypted 
    expect(user.password).not.toBe('Yehuda12')

})

//Sending a test request to /users/login which logs in a user
test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    //Assert that the token in response matches user's second token
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
    
})

//Sending a test request to /users/login with bad credentials, expecting it to fail
test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: "wrong@test.com",
        password: "incorrect123"
    }).expect(400)
})

//Sending a test request to /users/me which returns the user's profile
test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

//Sending an unauthorized test request to /users/me expecting it to fail
test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send() 
        .expect(401)
})

//Sending a test request to /users/me to delete a user
test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    //Assert null response (therefore the user has been removed)
    const user = await User.findById(userOneId)
    expect(user).toBeNull
})

//Sending a test request to /users/me to fail deleting an unauthorized account
test('Should not delete account for unauthorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

//Uploading profile image and asserting success
test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    //Assert that the user's avatar is being saved as binary in the database
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer)) // using expect.any() to expect it to be any sort of buffer
})

//Sending a test request to /users/me to update user's data
//Assert that the user's data in the database was updated successfully
test('Should update valid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Joshua"
        })
        .expect(200)
    //Assert the user's name has been changed
    const user = await User.findById(userOneId)
    expect(user.name).toBe("Joshua")
})

//Sending a test request to /users/me to make sure invalid user fields are not being updated in the database
test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Rishon Letsiyon"
        }).expect(400)
})
    
//Sending a test request to /users to avoid signing up user with invalid data
test('Should not signup user with invalid name/email/password', async () => {
    await request(app)
        .post('/users')
        .send({
            name: '%',
            email: 'h5ytguf@gmail.com',
            password: '123',
        }).expect(400)     
})

//Sending a test request to /users/me to make sure no update was being made without authentication
test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'shlomo'
        }).expect(401)
})

//Sending a test request to /users/me to make sure no invalid updates were being made
test('Should not update user with invalid name/email/password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: '123'
        }).expect(400)
})

//Sending a test request to /users/me to make sure unauthorized user isnt being deleted
test('Should not delete user if unauthorized', async () => {
    await request (app)
        .delete('/users/me')
        .send()
        .expect(401)
})