// routes/students.js - Student API Routes
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Validation middleware
const validateStudent = (req, res, next) => {
  const { studentId, firstName, lastName, email, age, major, enrollmentYear } = req.body;
  const errors = [];

  if (!studentId || typeof studentId !== 'string' || studentId.trim().length === 0) {
    errors.push('Student ID is required and must be a non-empty string');
  }

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    errors.push('First name is required and must be a non-empty string');
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    errors.push('Last name is required and must be a non-empty string');
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!age || typeof age !== 'number' || age < 16 || age > 100) {
    errors.push('Age is required and must be between 16 and 100');
  }

  if (!major || typeof major !== 'string' || major.trim().length === 0) {
    errors.push('Major is required and must be a non-empty string');
  }

  if (!enrollmentYear || typeof enrollmentYear !== 'number') {
    errors.push('Enrollment year is required and must be a number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

// GET /api/students - Get all students with filtering and pagination (fetch all)
router.get("/", async (req, res) => {
  try {
    let query = {};
    
    // Filter by major
    if (req.query.major) {
      query.major = new RegExp(req.query.major, 'i');
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Filter by enrollment year
    if (req.query.enrollmentYear) {
      query.enrollmentYear = parseInt(req.query.enrollmentYear);
    }

    // Search by name or email
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort = { createdAt: -1 }; // Default: newest first
    }

    const students = await Student.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
 
// GET /api/students/stats - Get student statistics
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const inactiveStudents = await Student.countDocuments({ isActive: false });

    // Get students by major
    const byMajor = await Student.aggregate([
      { $group: { _id: '$major', count: { $sum: 1 }, avgGPA: { $avg: '$gpa' } } },
      { $sort: { count: -1 } }
    ]);

    // Average GPA
    const avgGPAResult = await Student.aggregate([
      { $group: { _id: null, avgGPA: { $avg: '$gpa' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        averageGPA: avgGPAResult[0]?.avgGPA || 0,
        byMajor: byMajor.map(m => ({
          major: m._id,
          count: m.count,
          averageGPA: m.avgGPA
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/students/:id - Get single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/students - Create new student
router.post("/", validateStudent, async (req, res) => {
    const {name, age, email } = req.body;
     
  try {
    const student = new Student(req.body);
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Student ID or email already exists'
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', validateStudent, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/students/:id - Delete student
router.delete(" /:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;