const request = require("supertest");
const app = require("../src/app");
const User = require('../src/models/user');
const { newUser, userOne, userOneId, userOneToken, userTwo, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase);

test('Should sign up a new user', async () => {
    const response = await request(app).post('/users').send(newUser).expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: newUser.name,
            email: newUser.email
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe(newUser.password);
});

test('Should fail trying to sign up a new user with bad password', async () => {
    await request(app).post('/users').send({
        name: 'bob',
        email: 'asdf@gma.com',
        password: 'aaaaa',
    }).expect(400);
});

test('Should fail trying to sign up a new user with bad email', async () => {
    await request(app).post('/users').send({
        name: 'bob',
        email: 'asdf@gma',
        password: 'asdf#443!',
    }).expect(400);
});

test('Should fail trying to sign up a new user with bad username', async () => {
    await request(app).post('/users').send({
        name: 1,
        email: 'asdf@gma',
        password: 'asdf#443!',
    }).expect(400);
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
        .set('Authorization', userOneToken)
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
        .set('Authorization', userOneToken)
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

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', userOneToken)
        .attach('avatar', 'tests/fixtures/avatar.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toStrictEqual(expect.any(Buffer));
});

test('Should update user fields', async () => {
    const res = await request(app)
        .patch('/users/me')
        .set('Authorization', userOneToken)
        .send({
            name: 'Bob Nevins'
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Bob Nevins');
    expect(res.body.name).toBe('Bob Nevins');
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', userOneToken)
        .send({
            sentence: 'Bob Nevins'
        })
        .expect(400)
});

test('Should not update user fields due to invalid user authorization', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Bob Nevins'
        })
        .expect(401)
});
