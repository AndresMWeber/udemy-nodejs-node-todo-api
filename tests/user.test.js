const request = require("supertest");
const app = require("../src/app");
const User = require('../src/models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'Testman',
    email: 'test@test.com',
    password: '56what!!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

const userTwo = {
    name: 'Andrew',
    email: 'andrew@example.com',
    password: 'MyPass777!'
};

beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

test('Should singup a new user', async () => {
    const response = await request(app).post('/users').send(userTwo).expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: userTwo.name,
            email: userTwo.email
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe(userTwo.password);
});

test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password,
    }).expect(200);
});

test('Should not login non existing user', async () => {
    await request(app).post('/users/login').send({
        email: "blargon@gmail.com",
        password: 'asdfe123',
    }).expect(400);
});

test('Should validate token generated from user login', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password,
    }).expect(200);
    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login existing user, wrong password', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: 'asdfe123',
        })
        .expect(400);
});

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Should delete profile for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    expect(await User.findById({ _id: userOne._id })).toBeNull();
    expect(await User.findById({ _id: response.body._id })).toBeNull();
});

test('Should not delete profile for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});
