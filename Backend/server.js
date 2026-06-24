require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();

const PORT = process.env.PORT || 3000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose.connect(process.env.MONGO_URI)

.then(() => {
    console.log('Connected to MongoDB');
})

.catch((error) => {
    console.log('MongoDB Error:', error);
});


// ===============================
// TEST ROUTE
// ===============================

app.get('/', (req, res) => {

    res.send('Backend Running');

});


// ===============================
// REGISTER ROUTE
// ===============================

app.post('/register', async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {

        console.log("REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// ===============================
// LOGIN ROUTE
// ===============================

app.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Incorrect password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            role: user.role
        });

    } catch (error) {

        console.log("LOGIN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});


// ===============================
// CREATE ATTENDANCE SESSION
// ===============================

app.post('/create-attendance', async (req, res) => {
    try {
        const { course, date, lecturer } = req.body;

        if (!course || !date) {
            return res.json({
                success: false,
                message: "Course and date are required"
            });
        }

        // Check if this exact session already exists
        const existing = await Attendance.findOne({ course, date });

        if (existing) {
            return res.json({
                success: false,
                message: `A session for "${course}" on ${date} already exists.`
            });
        }

        const newAttendance = new Attendance({
            course,
            date: new Date(date), // Normalizes HTML string parameters into MongoDB ISO dates
            lecturer,
            students: []
        });

        await newAttendance.save();

        res.json({
            success: true,
            message: "Attendance session created successfully"
        });

    } catch (error) {
        console.error("Attendance Session Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create an active attendance tracking node"
        
        });
    }
});
// ===============================
// GET ALL STUDENTS
// ===============================

app.get('/students', async (req, res) => {

    try {

        const students = await User.find({ role: "student" });

        res.json(students);

    } catch (error) {

        console.log("GET STUDENTS ERROR:", error);

        res.status(500).json([]);

    }

});


// ===============================
// GET ALL SESSIONS (for dropdowns)
// ===============================

app.get('/sessions', async (req, res) => {

    try {

        const sessions = await Attendance.find({}, "course date _id").sort({ _id: -1 });

        res.json({ success: true, data: sessions });

    } catch (error) {

        console.log("SESSIONS ERROR:", error);

        res.status(500).json({ success: false, data: [] });

    }

});


// ===============================
// MARK ATTENDANCE
// ===============================

app.post('/mark', async (req, res) => {

    try {

        const { email, status, course } = req.body;

        if (status !== "Present" && status !== "Absent") {
            return res.json({
                success: false,
                message: "Status must be 'Present' or 'Absent'"
            });
        }

        const attendance = await Attendance.findOne({ course }).sort({ _id: -1 });

        if (!attendance) {
            return res.json({
                success: false,
                message: "No attendance session found for this course. Create one first."
            });
        }

        const existingEntry = attendance.students.find(
            s => s.studentEmail === email
        );

        if (existingEntry) {
            existingEntry.status = status;
        } else {
            attendance.students.push({ studentEmail: email, status });
        }

        await attendance.save();

        res.json({
            success: true,
            message: `${status} marked for student`
        });

    } catch (error) {
        console.error("🔥 FULL USER LOG ARCHIVE ERROR:", error);
        res.status(500).json({ 
            success: false, 
            message: "Database retrieval exception encountered",
            data: [] 
        });

    }

});


// ===============================
// UPDATE ATTENDANCE
// ===============================

app.put('/update-attendance', async (req, res) => {

    try {

        const { email, course, status } = req.body;

        if (status !== "Present" && status !== "Absent") {
            return res.json({
                success: false,
                message: "Status must be 'Present' or 'Absent'"
            });
        }

        const attendance = await Attendance.findOne({ course });

        if (!attendance) {
            return res.json({
                success: false,
                message: "Attendance not found"
            });
        }

        const student = attendance.students.find(
            s => s.studentEmail === email
        );

        if (!student) {
            return res.json({
                success: false,
                message: "Student record not found"
            });
        }

        student.status = status;

        await attendance.save();

        res.json({
            success: true,
            message: "Attendance updated successfully"
        });

    } catch (error) {

        console.log("UPDATE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Update failed"
        });

    }

});


// ===============================
// GET STUDENT'S OWN ATTENDANCE
// ===============================

app.get('/my-attendance/:email', async (req, res) => {

    try {

        const { email } = req.params;

        const records = await Attendance.find({
            "students.studentEmail": email
        });

        const result = records.map(record => {

            const studentEntry = record.students.find(
                s => s.studentEmail === email
            );

            return {
                course: record.course,
                date: record.date,
                status: studentEntry ? studentEntry.status : "Unknown"
            };

        });

        res.json({ success: true, data: result });

    } catch (error) {

        console.log("MY ATTENDANCE ERROR:", error);

        res.status(500).json({ success: false, data: [] });

    }

});


// ===============================
// GET ALL ATTENDANCE SESSIONS (full list)
// ===============================

app.post('/create-attendance', async (req, res) => {
    try {
        const { course, date, lecturer } = req.body;

        if (!course || !date) {
            return res.json({
                success: false,
                message: "Course and date are required"
            });
        }

        
        const existing = await Attendance.findOne({ course, date: new Date(date) });

        if (existing) {
            return res.json({
                success: false,
                message: `A session for "${course}" on ${date} already exists.`
            });
        }

        const newAttendance = new Attendance({
            course,
            date: new Date(date), // Normalizes HTML string parameters into MongoDB ISO dates
            lecturer,
            students: []
        });

        await newAttendance.save();

        res.json({
            success: true,
            message: "Attendance session created successfully"
        });

    } catch (error) {

        console.log("CREATE ATTENDANCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create an active attendance tracking node"
        });
    }
});

// ===============================
// DELETE ATTENDANCE SESSION
// ===============================

app.delete('/attendance/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const deleted = await Attendance.findByIdAndDelete(id);

        if (!deleted) {
            return res.json({
                success: false,
                message: "Attendance not found"
            });
        }

        res.json({
            success: true,
            message: "Attendance deleted successfully"
        });

    } catch (error) {

        console.log("DELETE ERROR:", error);

        res.status(400).json({
            success: false,
            message: "Invalid attendance ID"
        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});