const request = require("supertest");
const app = require("../src/app");
const User = require('../src/models/user');

beforeEach(async () => {
    await User.deleteMany();
});

test('Should singup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Andrew',
        email: 'andrew@example.com',
        password: 'MyPass777!'
    }).expect(201);
});
