import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './Config/dbConfig';
import studentRouter from './routes/student/studentRouter';
import tutorRouter from './routes/tutor/tutorRouter'
import adminRouter from './routes/admin/adminRouter';
import cookieParser from 'cookie-parser'

dotenv.config();



const app = express();
app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 4000;

connectDb()
app.use('/api/student',studentRouter);
app.use('/api/tutor',tutorRouter);
app.use('/api/admin',adminRouter);


// app.get('/', (req:Request, res:Response) => {
//   res.send('Hello World!');
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

