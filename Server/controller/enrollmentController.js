const Enrollment = require('../models/enrollment');
const Student = require('../models/student');
const Submission = require('../models/submission');
const Contest = require('../models/contest');

// const getEnrolledStudentsWithGrades = async (req, res) => {
//   try {
//     const { contestId } = req.params;

//     // Find all enrollments for the given contestId
//     const enrollments = await Enrollment.find({ contestId });


//     // Extract student IDs from the enrollments
//     const studentIds = enrollments.map(enrollment => enrollment.studentId);


//     // Query the Student collection to get details of enrolled students
//     const students = await Student.find({ _id: { $in: studentIds } });

//     // Calculate total grades for each student in the contest
//     const studentsWithGrades = await Promise.all(students.map(async (student) => {
//     const submissions = await Submission.find({ userId: student.userId, contestId });

//       // Group submissions by problem ID
//       const submissionGroups = {};
//       submissions.forEach(submission => {
//         if (!submissionGroups[submission.problemId]) {
//           submissionGroups[submission.problemId] = [];
//         }
//         submissionGroups[submission.problemId].push(submission);
//       });

//       // Calculate highest grade for each problem
//       const highestGrades = {};
//       for (const [problemId, problemSubmissions] of Object.entries(submissionGroups)) {
//         const highestGrade = Math.max(...problemSubmissions.map(submission => submission.grade));
//         highestGrades[problemId] = highestGrade;
//       }

//       // Sum highest grades for each problem
//       let totalGrade = 0;
//       for (const grade of Object.values(highestGrades)) {
//         totalGrade += grade;
//       }

//       return {
//         regNo : student.regNo,
//         username: student.username,
//         totalGrade
//       };
//     }));

//     res.status(200).json({ studentsWithGrades });
//   } catch (error) {
//     console.error('Error fetching enrolled students with grades:', error);
//     res.status(500).json({ error: 'Failed to fetch enrolled students with grades' });
//   }
// };

const getEnrolledStudentsWithGrades = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { page = 1, limit = 5 } = req.query; // Add pagination parameters

    // Find all enrollments for the given contestId
    const enrollments = await Enrollment.find({ contestId });

    // Extract student IDs from the enrollments
    const studentIds = enrollments.map(enrollment => enrollment.studentId);

    // Query the Student collection to get details of enrolled students with pagination
    const students = await Student.find({ _id: { $in: studentIds } })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Calculate total grades for each student in the contest
    const studentsWithGrades = await Promise.all(students.map(async (student) => {
      const submissions = await Submission.find({ userId: student.userId, contestId });

      // Group submissions by problem ID
      const submissionGroups = {};
      submissions.forEach(submission => {
        if (!submissionGroups[submission.problemId]) {
          submissionGroups[submission.problemId] = [];
        }
        submissionGroups[submission.problemId].push(submission);
      });

      // Calculate highest grade for each problem
      const highestGrades = {};
      for (const [problemId, problemSubmissions] of Object.entries(submissionGroups)) {
        const highestGrade = Math.max(...problemSubmissions.map(submission => submission.grade));
        highestGrades[problemId] = highestGrade;
      }

      // Sum highest grades for each problem
      let totalGrade = 0;
      for (const grade of Object.values(highestGrades)) {
        totalGrade += grade;
      }

      return {
        regNo: student.regNo,
        username: student.username,
        totalGrade
      };
    }));

    // Get the total number of students for pagination
    const totalStudents = await Student.countDocuments({ _id: { $in: studentIds } });

    res.status(200).json({
      studentsWithGrades,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrolled students with grades' });
  }
};


const getEnrolledStudents = async (req, res) => {
  try {
    const { contestId } = req.params;

    // Find all enrollments for the given contestId
    const enrollments = await Enrollment.find({ contestId });

    // Extract student IDs from the enrollments
    const studentIds = enrollments.map(enrollment => enrollment.studentId);

    // Query the Student collection to get details of enrolled students
    const enrolledStudents = await Student.find({ _id: { $in: studentIds } });

    res.status(200).json({ enrolledStudents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrolled students' });
  }
};

const createEnrollment = async (req, res) => {
  try {
    const { studentId, contestId } = req.body;

    // Create a new enrollment document
    const enrollment = await Enrollment.create({
      studentId,
      contestId
    });

    res.status(201).json({ enrollment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
};

const getEnrolledStudent = async (req, res) => {
  try {
    const { studentId, contestId } = req.params;
    const enrollment = await Enrollment
      .findOne({ studentId, contestId })
      .populate('studentId');
    res.status(200).json({ enrollment });
  }
  catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrolled student' });
  }
}

const getEnrollmentTime = async (req, res) => {
  try {
    const { userId, contestId } = req.params;
    
    // Find the student by the user ID
    const student = await Student.findOne({ userId });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = student._id;

    // Find the enrollment by studentId and contestId
    const enrollment = await Enrollment.findOne({ studentId, contestId });

    if (!enrollment) {
      return res.status(301).json({ error: 'Enrollment not found' });
    }

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const duration = Math.min(contest.duration, (new Date(contest.endDate).getTime() - new Date(enrollment.createdAt).getTime()) / 60000)

    res.status(200).json({ createdAt: enrollment.createdAt, duration});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollment time' });
  }
};

const getEnrolledContests = async (req, res) => {
  try {
    const { userId } = req.params;
    const student = await Student.findOne({ userId});
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const contests = await Contest.find({});
    const contestIds = contests.map(contest => contest._id);
    const enrollments = await Enrollment.find({ studentId: student._id,
      contestId: { $in: contestIds } }).populate('contestId');
    
    const currentDate = new Date();
    const availableContests = enrollments.filter(enrollment => {
      const endDate = new Date(enrollment.contestId.endDate);
      return currentDate > endDate || currentDate.getTime() > enrollment.createdAt.getTime() + enrollment.contestId.duration*60000;
    }).map(enrollment => enrollment.contestId);

    res.status(200).json({ contests : availableContests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrolled contests' });
  }
};




module.exports = { getEnrolledStudentsWithGrades,getEnrolledStudents , createEnrollment, getEnrolledStudent, getEnrollmentTime,getEnrolledContests};
