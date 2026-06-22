
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();

const PORT = 3000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose.connect('mongodb://127.0.0.1:27017/attendance_system')

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

        const { name, email, password, role} = req.body;

        console.log("REGISTER ROUTE HIT");
        console.log("ROLE:", role)

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Original Password:", password);
        console.log("Hashed Password:", hashedPassword);

        // CREATE USER
        const newUser = new User({
            name,
            email,
            password: hashedPassword,   
            role
        });

        // SAVE USER
        await newUser.save();

        res.json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
    console.log("🔥 FULL REGISTER ERROR:", error); // VERY IMPORTANT

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

        // FIND USER
        const user = await User.findOne({ email });

        // USER NOT FOUND
        if (!user) {

            return res.json({
                success: false,
                message: "User not found"
            });

        }

        // COMPARE PASSWORD
        const isMatch = await bcrypt.compare(password, user.password);

        // WRONG PASSWORD
        if (!isMatch) {

            return res.json({
                success: false,
                message: "Incorrect password"
            });

        }

        // LOGIN SUCCESS
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

//Attendance Route

app.post('/create-attendance', async (req, res) => {
    try {
        const { course, date, lecturer } = req.body;

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


//Get all Students  

app.get('/students', async (req, res) => {

    try {

        const students = await User.find({ role: "student" });

        res.json(students);

    } catch (error) {

        console.log(error);

        res.json([]);

    }

});

//Mark Router 

app.post('/mark', async (req, res) => {

    try {

        const { email, status, course } = req.body;

        // Find the most recent attendance session for this course
        const attendance = await Attendance.findOne({ course }).sort({ _id: -1 });

        if (!attendance) {
            return res.json({
                success: false,
                message: "No attendance session found for this course. Create one first."
            });
        }

        // Check if this student already has a status recorded for this session
        const existingEntry = attendance.students.find(
            s => s.studentEmail === email
        );

        if (existingEntry) {
            // Update their existing status (in case lecturer clicks Present then changes to Absent)
            existingEntry.status = status;
        } else {
            // Add them for the first time
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
// GET STUDENT'S OWN ATTENDANCE
// ===============================

app.get('/my-attendance/:email', async (req, res) => {

    try {

        const { email } = req.params;

        // Find all attendance records where this student was marked
        const records = await Attendance.find({
            "students.studentEmail": email
        });

        // Extract just this student's status from each record
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

        res.json({ success: false, data: [] });

    }

});








// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
