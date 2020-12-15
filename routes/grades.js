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

router.get('/:id', async (req, res, next) => {
  try {
    const data = await dataReader();
    const id = req.params.id;
    const grade = getGradeById(data, id);

    if (grade == null) {
      throw new Error('Id not found');
    }

    res.send(grade);
    logger.info(`GET /grade - ${JSON.stringify(grade)}`);
  } catch (error) {
    next(error);
  }
});

router.get('/sum/:student/:subject/', async (req, res, next) => {
  try {
    const data = await dataReader();
    const { student, subject } = req.params;

    const studentGradesBySubject = data.grades.filter(
      (grade) => grade.subject === subject && grade.student === student
    );

    const somaNotas = studentGradesBySubject.reduce(
      (acc, curr) => acc + curr.value,
      0
    );

    res.send({ soma: somaNotas });
  } catch (error) {
    next(error);
  }
});

router.get('/avg/:subject/:type', async (req, res, next) => {
  try {
    const data = await dataReader();
    const { subject, type } = req.params;

    const typeGradesBySubject = data.grades.filter(
      (grade) => grade.subject === subject && grade.type === type
    );

    const somaNotas = typeGradesBySubject.reduce(
      (acc, curr) => acc + curr.value,
      0
    );

    const quantity = Object.keys(typeGradesBySubject).length;

    res.send({ media: somaNotas / quantity });
  } catch (error) {
    next(error);
  }
});

router.get('/top/:subject/:type', async (req, res, next) => {
  try {
    const data = await dataReader();
    const { subject, type } = req.params;

    let typeGradesBySubject = data.grades.filter(
      (grade) => grade.subject === subject && grade.type === type
    );

    typeGradesBySubject = typeGradesBySubject.sort((a, b) => b.value - a.value);

    let top3 = typeGradesBySubject.slice(0, 3);

    res.send(top3);
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
