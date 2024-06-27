const express = require('express');
const routes = express.Router();

const { updateLecturer,getLecturer,getLecturers,deleteLecturer } = require('../controller/lecturerController');

routes.put('/:id', updateLecturer);
routes.get('/:userId', getLecturer);
routes.get('/', getLecturers);
routes.delete('/:id', deleteLecturer);

module.exports = routes;

