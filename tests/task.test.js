const request = require("supertest");
const app = require("../src/app");
const Task = require('../src/models/task');
const { setupDatabase, userOneToken, userTwoToken, taskOne } = require('./fixtures/db')

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', userTwoToken)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test('Should get all tasks for user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', userOneToken)
        .expect(200)
    expect(response.body.length).toEqual(2);
});

test('Should get all tasks for user 2', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', userTwoToken)
        .expect(200)
    expect(response.body.length).toEqual(1);
});

test('Should fail deleting unauthorized task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', userTwoToken)
        .expect(404)
    expect(Task.findById(taskOne._id)).not.toBeNull()
});