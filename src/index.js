const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const indexRouter = require('./routers/index');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(indexRouter);
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});