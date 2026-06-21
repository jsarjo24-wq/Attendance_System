const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({

    course: {
        type: String,
        required: true
    },

    lecturer: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    students: [
        {
            studentEmail: String,
            status: String
        }
    ]

});

module.exports = mongoose.model('Attendance', attendanceSchema);