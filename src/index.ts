import express from 'express';
import { connectToWhatsApp } from './whatsapp/client';
import apiRoutes from './routes/api';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Dashboard (Static Files)
app.use(express.static(path.join(__dirname, '../dashboard/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  connectToWhatsApp().catch(err => {
    console.error('Failed to initialize WhatsApp connection:', err);
  });
});
