const Student = require('../models/student');
const User = require('../models/user');

const updateStudent = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the provided email already exists in the database

        const std = await Student.findById(id);
        const { email } = req.body;
        const existingUser = await User.findOne({ email : email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== std.userId.toString()) {
           // If email exists and belongs to a different user, return an error
            return res.status(400).json({ error: 'Email already exists' });
        }

        //check for duplicate registration number
        const existingRegNo = await Student.findOne({ regNo: req.body.regNo });
        if (existingRegNo && existingRegNo._id.toString() !== id.toString()) {
            return res.status(400).json({ error: 'Registration number already exists' });
        }
        const updatedUser = await User.findByIdAndUpdate(std.userId, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
        // Return both updated user and student

        res.status(200).json({ updatedUser, updatedStudent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getStudent = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the student with the provided userId
        const student = await Student.findOne({ userId });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Return the student
        
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getStudents = async (req, res) => {
   

    try {
        
        // Find all students
        const students = await Student.find({});


        if (!students) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Return the student
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        // Find and delete the lecturer by ID
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Find and delete the user associated with the lecturer's email
        const deletedUser = await User.findOneAndDelete({ email: deletedStudent.email });

        res.status(200).json({ lecturer: deletedStudent, user: deletedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    updateStudent,
    getStudent,
    getStudents,
    deleteStudent
};
