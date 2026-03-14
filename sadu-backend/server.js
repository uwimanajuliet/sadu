import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adRoutes from './routes/adRoutes.js';
import carRoutes from './routes/carRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';   // ✅ default import
import paymentRoutes from './routes/paymentRoutes.js';   // ✅ default import

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ads',        adRoutes);
app.use('/api/cars',       carRoutes);
app.use('/api/bookings',   bookingRoutes);   // ✅ fixed
app.use('/api/payments',   paymentRoutes);   // ✅ fixed

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are SADU AI Assistant, a helpful assistant for the SADU Transport & Tourism website based in Kigali, Rwanda.

You help users with:
- Finding transport services like taxis, buses, delivery services
- Finding tourism and hospitality services like hotels, tours, travel agencies
- Finding internship opportunities for students in fields like Software Development, Networking, Multimedia, Tourism, Accounting, Computer Systems
- Guiding students on how to apply for internships by clicking the Apply Now button and filling the form
- Answering general questions about the website
- Providing contact information: Phone +250 89846899, Email julietuwimana30@gmail.com, Location Kigali Rwanda

Keep responses short, friendly and helpful. Always respond in the same language the user writes in.`,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ message: 'AI error', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));