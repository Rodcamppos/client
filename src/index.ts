import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

dotenv.config();

const app: Express = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const corsOptions = {
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/chat', chatbotRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // console.log(`Servidor rodando na porta ${PORT}`);
  // console.log(`Aceitando requisições do cliente em: ${clientUrl}`);
});
