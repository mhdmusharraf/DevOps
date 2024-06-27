const Lecturer = require('../models/lecturer');
const User = require('../models/user');

const updateLecturer = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the provided email already exists in the database

        const lec = await Lecturer.findById(id);
        const { email,isApproved } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });


        if (existingUser && existingUser._id.toString() !== lec.userId.toString()) {
           // If email exists and belongs to a different user, return an error
            return res.status(400).json({ error: 'Email already exists' });
        }


        const updatedUser = await User.findByIdAndUpdate(lec.userId, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedLec = await Lecturer.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedLec) {
            return res.status(404).json({ error: 'Student not found' });
        }
        // Return both updated user and student

        res.status(200).json({ updatedUser, updatedLec });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getLecturer = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the student with the provided userId
        const lecturer = await Lecturer.findOne({ userId });

        if (!lecturer) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Return the student
        res.status(200).json(lecturer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getLecturers = async (req, res) => {

    try {
        
        const lecturers = await Lecturer.find().sort({ createdAt: -1 });
        


        if (!lecturers) {
            return res.status(404).json({ error: 'Lecturer not found' });
        }

        // Return the student
        res.status(200).json(lecturers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteLecturer = async (req, res) => {
    const { id } = req.params;
    try {
        // Find and delete the lecturer by ID
        const deletedLecturer = await Lecturer.findByIdAndDelete(id);
        if (!deletedLecturer) {
            return res.status(404).json({ error: 'Lecturer not found' });
        }

        // Find and delete the user associated with the lecturer's email
        const deletedUser = await User.findOneAndDelete({ email: deletedLecturer.email });

        res.status(200).json({ lecturer: deletedLecturer, user: deletedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    updateLecturer,
    getLecturer,
    getLecturers,
    deleteLecturer
};
