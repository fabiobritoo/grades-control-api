import express from 'express';
import winston from 'winston';
import { promises as fs } from 'fs';
import gradesRouter from './routes/grades.js';

const { readFile, writeFile } = fs;

const app = express();

global.fileName = 'grades.json';

// Configurar o log

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('API Started!');
});
