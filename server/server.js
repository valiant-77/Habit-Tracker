require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const nodemailer = require('nodemailer');
const PORT = 3000;


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
/******************************************************************************
 * Serve static files (your frontend HTML, CSS, JS)
 ******************************************************************************/
app.use(express.static(path.join(__dirname, '../client/src')));

/******************************************************************************
 * Connect to MongoDB
 ******************************************************************************/
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));

/******************************************************************************
 * Middleware to parse JSON
 ******************************************************************************/
app.use(express.json());


/******************************************************************************
 * Define Mongoose Schemas
 ******************************************************************************/
// Define the User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});


// Define the Task schema
const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    time: { type: String, required: true },
    completed: { type: Map, of: Boolean, default: {} }, // Track completion per date
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Associate task with user
});

/******************************************************************************
 * Create Mongoose Models
 ******************************************************************************/
// Create the User model
const User = mongoose.model('User', userSchema);



// Create the Task model
const Task = mongoose.model('Task', taskSchema);


/******************************************************************************
 * Authentication Middleware
 ******************************************************************************/
// Authentication middleware
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};


// Email validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/******************************************************************************
 * Routes
 ******************************************************************************/



/****************Route to register a new user***********************/
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Return success response
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register user' });
    }
});




/**************** Route to login a user***********************/ 
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Compare the provided password with the hashed password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // Return the token
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Failed to login' });
    }
});

/****************Route to fetch user data***********************/ 
app.get('/api/user', authenticate, async (req, res) => {
    try {
        // Find the user by ID and exclude the password field
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the user data
        res.json(user);
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

/**************** Route to fetch tasks for the authenticated user***********************/
app.get('/api/tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

/****************  Route to add a new task for the authenticated user***********************/
app.post('/api/tasks', authenticate, async (req, res) => {
    const { name, time } = req.body;

    if (!name || !time) {
        return res.status(400).json({ error: 'Task name and time are required' });
    }

    try {
        const newTask = new Task({ name, time, user: req.user._id });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save task' });
    }
});

/****************Route to update a task for the authenticated user***********************/
app.put('/api/tasks/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, time } = req.body;

    if (!name || !time) {
        return res.status(400).json({ error: 'Task name and time are required' });
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user: req.user._id }, // Ensure the task belongs to the user
            { name, time },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

/****************Route to delete a task for the authenticated user***********************/
app.delete('/api/tasks/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

/****************Route to save multiple tasks***********************/
app.post('/api/tasks/save', authenticate, async (req, res) => {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Invalid tasks data' });
    }

    try {
        // Delete existing tasks for the user
        await Task.deleteMany({ user: req.user._id });

        // Save new tasks
        const newTasks = tasks.map(task => ({
            name: task.name,
            time: task.time,
            user: req.user._id,
        }));

        await Task.insertMany(newTasks);

        res.json({ message: 'Schedule saved successfully' });
    } catch (err) {
        console.error('Error saving tasks:', err);
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

/****************Route to delete all tasks for the authenticated user***********************/
app.delete('/api/tasks', authenticate, async (req, res) => {
    try {
        await Task.deleteMany({ user: req.user._id });
        res.json({ message: 'All tasks deleted successfully. Schedule has been reset.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete all tasks' });
    }
});

/****************Route to update task completion status for a specific date***********************/
app.patch('/api/tasks/:id/complete', authenticate, async (req, res) => {
    const { id } = req.params;
    const { completed, date } = req.body;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const task = await Task.findOne({ _id: id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update completion status for the specific date
        task.completed.set(date, completed);
        await task.save();

        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task completion status' });
    }
});

/****************Route to get completion rates for a date range for the authenticated user***********************/
app.get('/api/completion-rates', authenticate, async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }

    try {
        // Get all tasks for the authenticated user
        const tasks = await Task.find({ user: req.user._id });

        // Create a map to store completion rates for each date
        const completionRates = {};

        // Convert dates to the format used in the database (DD-MM-YYYY)
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Iterate through each date in the range
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateKey = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

            // Count completed tasks for this date
            let completedCount = 0;
            let totalTasks = tasks.length;

            // Skip dates with no tasks
            if (totalTasks === 0) {
                completionRates[dateKey] = 0;
                continue;
            }

            // Check completion status for each task
            tasks.forEach(task => {
                if (task.completed && task.completed.get(dateKey)) {
                    completedCount++;
                }
            });

            // Calculate completion rate as percentage
            completionRates[dateKey] = (completedCount / totalTasks) * 100;
        }

        res.json(completionRates);
    } catch (err) {
        console.error('Error fetching completion rates:', err);
        res.status(500).json({ error: 'Failed to fetch completion rates' });
    }
});


/****************Route to handle feedback submissions***********************/
app.post('/api/feedback', async (req, res) => {
    try {
        const { feedback, email,Name } = req.body;
        const defaultEmail = process.env.FEEDBACK_EMAIL || process.env.EMAIL_USER; // Use a dedicated feedback email or fall back to your main email
        
        if (!feedback || feedback.trim() === '') {
            return res.status(400).json({ error: 'Feedback content is required' });
        }

        // Prepare email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: defaultEmail,
            subject: 'HabitTracker Feedback',
            html: `
                <h2>New Feedback Received</h2>
                <p><strong>Feedback:</strong> ${feedback}</p>
                ${Name ? `<p><strong>User Name:</strong> ${Name}</p>` : '<p><strong>User Name:</strong> Not provided</p>'}
                ${email ? `<p><strong>User Email:</strong> ${email}</p>` : '<p><strong>User Email:</strong> Not provided</p>'}
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            `
        };
        
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Feedback email sent successfully');
        
        res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

/******************************************************************************
 * Start the server
 ******************************************************************************/
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});