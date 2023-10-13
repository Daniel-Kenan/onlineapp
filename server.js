const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;
const ejs = require('ejs');

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: 'gfgh435',
    resave: false,
    saveUninitialized: true,
  })
);


const isAdmin = (req, res, next) => {
    const user = req.session.user;

    if (user && user.isAdmin) {
        next();
    } else {
        res.redirect('/signin'); // Redirect to login if not an admin
    }
};
app.use('/adminDashboard', isAdmin);


const users = [
    { name: 'User 1', id: 'user1', email: 'user1@example.com', password: 'user1Password' },
    { name: 'Admin', id: 'admin', email: 'admin@example.com', password: 'adminPassword', isAdmin: true },
];
const applications = [];

const schools = [
  { name: 'School A', enrolledStudents: 100, pendingApplications: 20 },
  { name: 'School B', enrolledStudents: 150, pendingApplications: 15 },
];

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/signin');
  } else {
    next();
  }
};

// Guest View: View available schools
app.get('/schools', (req, res) => {
  res.render('schools', { schools });
});

// Signup
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const { name, id, email, pass1 } = req.body;
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    res.render('signup', { error: 'User with the same email already exists' });
  } else {
    users.push({ name, id, email, password: pass1 });
    res.redirect('/signin');
  }
});

// Login
app.get('/signin', (req, res) => {
  res.render('login');
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    console.log(email,"===",password)
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Assuming you are using express-session to manage sessions
        req.session.user = user;
        
        if (user.isAdmin) {
            console.log('ggg')
            // Redirect to the admin dashboard if the user is an admin
            res.redirect('/adminDashboard');
        } else {
            // Redirect to the user dashboard for regular users
            res.redirect('/userDashboard');
        }
    } else {
        // Render the login page with an error message
        res.render('login', { error: 'Invalid Credentials' });
    }
});



// User Dashboard
app.get('/userDashboard', requireLogin, (req, res) => {
  const user = req.session.user;
  res.render('userDashboard', { user });
});

// Apply to School
app.post('/apply/:schoolName', requireLogin, (req, res) => {
    const user = req.session.user;
    const schoolName = req.params.schoolName;
    const school = schools.find((s) => s.name === schoolName);
  
    if (user && school) {
      // You may want to check if the user has already applied to this school before allowing them to apply again
      const existingApplication = applications.find((app) => app.user.email === user.email && app.school.name === school.name);
      if (existingApplication) {
        res.redirect('/schools');
      } else {
        applications.push({ user, school, status: 'Pending' });
        res.redirect('/userDashboard');
      }
    } else {
      res.redirect('/schools');
    }
  });

// Track Application
// Add this route to your server code

// Track Application
app.get('/trackApplication', requireLogin, (req, res) => {
    const user = req.session.user;
    if (user) {
      const userApplications = applications.filter((app) => app.user.email === user.email);
      res.render('trackApplication', { userApplications });
    } else {
      res.redirect('/signin');
    }
  });
  
// Admin Dashboard
app.get('/adminDashboard', isAdmin, (req, res) => {
    // Assuming you have an array called `applications` that holds all applications
    const allApplications = applications; // Replace this with your actual data source

    res.render('dashboard', { applications: allApplications });
});

// Update Application Status
app.post('/updateStatus/:applicationId', (req, res) => {
  const applicationId = req.params.applicationId;
  const newStatus = req.body.newStatus;

  const application = applications.find((app) => app.id === applicationId);
  if (application) {
    application.status = newStatus;
    res.redirect('/adminDashboard');
  } else {
    res.redirect('/adminDashboard');
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/guest', (req, res) => {
    res.render('guest', { schools });
  });


  app.get('/guest.html', (req, res) => {
    res.redirect('/guest');
  });
  
  // Redirect for Login Page
  app.get('/login.html', (req, res) => {
    res.redirect('/signin');
  });


app.get('/application-form', (req, res) => {
    // Render your application form page
    const user = req.session.user;
    res.render('applicationForm', { user: user }    ); // Pass user data to the template
});

app.get('/dashboard', (req, res) => {
    // Render your user dashboard page
    res.render('userDashboard', { user: req.user }); // Pass user data to the template
});

// Handle application form submission

app.post('/submit-application', (req, res) => {
    const { name, email, phone, school, grade } = req.body;

    // Assuming you have a user object stored in the session
    const user = req.session.user;

    // Create a new application object with a default status
    const newApplication = {
        user: user,
        name: name,
        email: email,
        phone: phone,
        school: school,
        grade: grade,
        status: 'Pending', // Default status when initially saving the application
    };

    // Save the application to the database (or push to an array)
    applications.push(newApplication);

    // Redirect or render a confirmation page
    res.render('applicationConfirmation', { name, school });
});


// Handle application form submission
app.post('/submit-application', (req, res) => {
    const { name, email, phone, school, grade } = req.body;

    // Process the form data (e.g., save to a database)

    // Render the confirmation page with the submitted data
    res.render('applicationConfirmation', { name, school });
});

app.get('/signout', (req, res) => {
    // Clear the user session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // Redirect to the home page or any other desired location after sign-out
            res.redirect('/');
        }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
