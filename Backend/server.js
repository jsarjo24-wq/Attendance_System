
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

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


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
