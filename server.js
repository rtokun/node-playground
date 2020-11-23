const express = require('express');
const bcrypt = require("bcrypt-nodejs");
const _ = require('lodash');
const cors = require("cors");

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

class LoginData {
    constructor(id, hash, email) {
        this.id = id;
        this.hash = hash;
        this.email = email;
    }
}

const database = {
    users: [
        {
            id: '123',
            name: 'john',
            email: 'john@gmail.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'sally',
            email: 'sally@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: []
};

hashPassword('John123')
    .then((hash) => {
        database.login.push(
            new LoginData("123", hash, 'john@gmail.com')
        );
    });

app.get('/', (req, res) => {
    res.json({
        data: [...database.users.values()]
    })
});

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    const user = database.users.find(user => user.id === id);
    if (user === undefined) {
        return res.status(404)
            .json("User not found")
    } else {
        return res.json(user);
    }
});

app.put('/image', (req, res) => {
    const {id} = req.body;
    const user = database.users.find(user => user.id === id);
    if (user === undefined) {
        return res.status(404)
            .json("User not found")
    } else {
        user.entries++;
        return res.json({
            entries: user.entries
        });
    }
});

app.post('/signin', async (req, res) => {

    const {email, password} = req.body;

    const data = database.login.find(loginData => loginData.email === email);
    if (data !== undefined) {

        try {
            const equal = await comparePasswords(password, data.hash);
            if (equal) {
                const user = database.users.find(user => user.id === data.id);
                return res.json(user);
            } else {
                return res.status(401).json({
                    error: "Wrong credentials"
                });
            }
        } catch (e) {
            return res.status(401).json({
                error: e
            });
        }


    } else return res.status(401).json({
        error: "Wrong credentials"
    });
});

app.post('/register', async (req, res) => {

    const {name, email, password} = req.body;

    if ([name, email, password].some(_.isEmpty)) {
        return res.status(400)
            .json("Please specify all required parameters");
    }

    const hashedPassword = await hashPassword(password);
    const id = uuidv4();

    const user = {
        id: id,
        name: name,
        email: email,
        entries: 0,
        joined: new Date()
    };

    const loginData = new LoginData(
        id, hashedPassword, email
    );

    database.users.push(user);
    database.login.push(loginData);

    return res.json(user)
});

const port = 4000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`)
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function hashPassword(password) {

    return new Promise((resolve, reject) => {
        bcrypt.hash(password, null, null, function (err, hash) {
            if (err) reject(err);
            resolve(hash)
        });
    })
}

function comparePasswords(password, hashed) {

    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashed, function (err, result) {
            if (err) reject(err);
            resolve(result)
        });
    })
}