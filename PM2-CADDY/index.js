const express = require('express')
const app = express();

const port = process.env.PORT || 3000;

// ?? - nullish cohesion operator

app.get('/' ,(req,res) => {
    res.send('Hello World');
});

app.get('/crash' ,(req,res) => {
    res.send('App crashing');
    process.exit(1);
});


app.get('/:id' ,(req,res) => {
    res.send(`hello world ${req.params.id}` );
});

app.listen(port , () => {
    console.log(`Server runnig on port ${port}`);
})