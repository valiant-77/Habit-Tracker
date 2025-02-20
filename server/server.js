const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// Serve static files (your frontend HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../client/src')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/habitTracker', {
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Define a Task schema
const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    time: { type: String, required: true },
    completed: { type: Map, of: Boolean, default: {} }, // Track completion per date
});

// Create a Task model
const Task = mongoose.model('Task', taskSchema);

// Middleware to parse JSON
app.use(express.json());

// Route to fetch tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Route to add a new task
app.post('/api/tasks', async (req, res) => {
    const { name, time } = req.body;

    if (!name || !time) {
        return res.status(400).json({ error: 'Task name and time are required' });
    }

    try {
        const newTask = new Task({ name, time });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save task' });
    }
});

// Route to update a task
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { name, time } = req.body;

    if (!name || !time) {
        return res.status(400).json({ error: 'Task name and time are required' });
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { name, time }, { new: true });
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Route to delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Task.findByIdAndDelete(id);
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Route to delete all tasks (entire schedule)
app.delete('/api/tasks', async (req, res) => {
    try {
        // Delete all tasks from the collection
        await Task.deleteMany({});
        res.json({ message: 'All tasks deleted successfully. Schedule has been reset.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete all tasks' });
    }
});

// Route to save the entire schedule
app.post('/api/save-schedule', async (req, res) => {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Invalid tasks data' });
    }

    try {
        // Delete existing tasks (optional, if you want to replace the entire schedule)
        await Task.deleteMany({});

        // Insert new tasks
        const savedTasks = await Task.insertMany(tasks);
        res.status(201).json(savedTasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save schedule' });
    }
});

// Route to update task completion status for a specific date
app.patch('/api/tasks/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { completed, date } = req.body;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const task = await Task.findById(id);
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});