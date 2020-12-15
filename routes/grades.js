import express from 'express';
import { promises as fs } from 'fs';
import winston from 'winston';

const currentTime = winston.format.timestamp;

const { writeFile, readFile } = fs;

const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Grades Route');
  logger.info('Inside route grades');
});

router.post('/', async (req, res, next) => {
  try {
    const { student, subject, type, value } = req.body;

    const data = await dataReader();

    const grade = {
      id: data.nextId++,
      student: student,
      subject: subject,
      type: type,
      value: value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await dataWriter(data);

    res.send(grade);
    logger.info(`POST /grade - ${JSON.stringify(grade)}`);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await dataReader();
    const id = req.params.id;
    const gradeToAlter = getGradeById(data, id);

    if (gradeToAlter == null) {
      throw new Error('Id not Found');
    }

    const { student, subject, type, value } = req.body;

    gradeToAlter.student = student;
    gradeToAlter.subject = subject;
    gradeToAlter.type = type;
    gradeToAlter.value = value;

    const index = getIndexByd(data, id);
    data.grades[index] = gradeToAlter;

    await dataWriter(data);
    logger.info(`PUT /grade - ${JSON.stringify(gradeToAlter)}`);

    res.send(gradeToAlter);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = await dataReader();
    const id = req.params.id;
    const gradeToDelete = getGradeById(data, id);

    if (gradeToDelete == null) {
      throw new Error('Id not Found');
    }

    data.grades = data.grades.filter((grade) => grade.id !== parseInt(id));
    await dataWriter(data);
    logger.info(`DELETE /grade - ${JSON.stringify(gradeToDelete)}`);

    res.send(gradeToDelete);
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

const dataReader = async () => {
  return JSON.parse(await readFile(global.fileName));
};

const dataWriter = async (data) => {
  await writeFile(global.fileName, JSON.stringify(data, null, 2));
};

const getGradeById = (data, id) => {
  return data.grades.find((grade) => grade.id === parseInt(id));
};

const getIndexByd = (data, id) => {
  return data.grades.findIndex((grade) => (grade.id = id));
};

export default router;
