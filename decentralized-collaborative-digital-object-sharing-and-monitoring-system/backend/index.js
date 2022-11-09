const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express(); 

// Middleware
app.use(bodyParser.json());
app.use(cors());
// app.use(express.json());

const posts = [{
    username: 'Dominik',
    title: 'Post 1'
},
    {
        username: 'Jim',
        title: 'Post 2'
    }]

app.get('/post', (req, res) =>{

    res.json(posts)
})

app.post('/notebook',(req, res) =>{ 
    
    console.log(req.body);
    res.json(req.body);
    // res.status(201).send('Notebook created');
})
const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`)); 