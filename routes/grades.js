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
    let grade = req.body;
    const data = JSON.parse(await readFile(global.fileName));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);
    logger.info(`POST /grade - ${JSON.stringify(grade)}`);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
