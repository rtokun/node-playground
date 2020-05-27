const express = require('express');
const _ = require('lodash');

const app = express();

app.use(express.urlencoded());
app.use(express.json());

const database = {
    users: [
        {
            id: '123',
            name: 'john',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: "987",
            hash: '',
            email: 'john@gmail.com'
        }
    ]
};

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

app.post('/image', (req, res) => {
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

app.post('/signin', (req, res) => {

    const {email, password} = req.body;

    const user = database.users.find(user => user.email === email);
    if (user !== undefined) {
        if (password === user.password) {
            return res.json("Success");
        } else {
            return res.status(401).json({
                error: "Wrong credentials"
            });
        }
    } else return res.status(401).json({
        error: "Wrong credentials"
    });
});

app.post('/register', (req, res) => {

    const {name, email, password} = req.body;

    if ([name, email, password].some(_.isEmpty)) {
        return res.status(400)
            .json("Please specify all required parameters");
    }

    const user = {
        id: uuidv4(),
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    };

    database.users.push(user);

    return res.json(user)
});

const port = 3000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`)
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/*



--> /image --> POST = user

 */