import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './Config/dbConfig';
import studentRouter from './routes/student/studentRouter';
import adminRouter from './routes/admin/adminRouter';

dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

connectDb()

app.use('/api/student',studentRouter);
app.use('/api/admin',adminRouter);


// app.get('/', (req:Request, res:Response) => {
//   res.send('Hello World!');
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

