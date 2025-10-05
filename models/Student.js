// models/Student.js - Student MongoDB Schema
const mongoose = require('mongoose');

// Define schema (rules to follow to create a collection of tables in the DB))
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [16, 'Age must be at least 16'],
    max: [100, 'Age must be less than 100']
  },
  major: {
    type: String,
    required: [true, 'Major is required'],
    trim: true
  },
  gpa: {
    type: Number,
    min: [0.0, 'GPA must be at least 0.0'],
    max: [4.0, 'GPA must be at most 4.0'],
    default: 0.0
  },
  enrollmentYear: {
    type: Number,
    required: [true, 'Enrollment year is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  courses: [{
    type: String
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get student info
studentSchema.methods.getStudentInfo = function() {
  return {
    id: this._id,
    studentId: this.studentId,
    fullName: this.fullName,
    email: this.email,
    major: this.major,
    gpa: this.gpa
  };
};

// Static method to find by student ID
studentSchema.statics.findByStudentId = function(studentId) {
  return this.findOne({ studentId });
};

//Create the model (represents collections of tables)
const Student = mongoose.model("Student", studentSchema);

model.exports = Student;