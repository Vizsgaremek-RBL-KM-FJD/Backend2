const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');

const usersRouter = require("./routes/users");
const port = 3000;

const app = express();

app.use(cors(
    {
        origin: ["http://localhost:4200", "https://localhost:4201"],
        credentials: true
    }
));

app.use(bodyParser.json());

app.use("/users", usersRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
    console.log(err.message, err.stack);
    res.status(err.statusCode || 500).json({error: err.message});
    return;
})

app.listen(port, () => {
    console.log(`Szerver fut a http://localhost:${port} címen`);
});