const express = require('express');
const routes = express.Router();

const {updateStudent,getStudent,getStudents,deleteStudent} = require('../controller/studentController');

routes.put('/:id', updateStudent);
routes.get('/:userId', getStudent);
routes.get('/', getStudents);
routes.delete('/:id', deleteStudent);

module.exports = routes;

