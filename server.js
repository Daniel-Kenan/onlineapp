const express = require('express');

const app = express();
const port = process.env.PORT || 3000 ;
const ejs = require('ejs');

const users = [];

const schools = [
    { name: 'School A', enrolledStudents: 100, pendingApplications: 20 },
    { name: 'School B', enrolledStudents: 150, pendingApplications: 15 },
  ];


app.get('/schools', (req, res) => {
    res.render('schools', { schools });
});


app.set('view engine','ejs');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))

app.get('/signup', (req, res) => {
return  res.render('signup')    
})

app.get('/signin', (req, res) => {
return  res.render('login')
})

app.get('/userDashboard', (req, res) => {
return  res.render('userDashboard')
})

app.get('/dashboard', (req, res) => {
return  res.render('dashboard')
})

app.get('/', (req, res) => {return    res.render('index')})

app.get('/guest', (req, res) => {return res.render('guest')})

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.username === email && u.password === password);
    if (user) {return res.render('userDashboard');} else { return res.render('login', { error: 'Invalid Credentials' }); }  
});

app.post('/signup', (req, res) => {
    const { name, id, email, pass1 } = req.body;
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        res.render('signup', { error: 'User with the same email already exists' });
    } else {
        users.push({ name, id, email, password: pass1 });
        res.redirect('/signin');
    }
});


app.listen(port);