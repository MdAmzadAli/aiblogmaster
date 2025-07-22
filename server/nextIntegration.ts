import next from 'next';
import { Express } from 'express';
import { log } from './vite';

export async function setupNextJs(app: Express) {
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev, dir: '.' });
  const handle = nextApp.getRequestHandler();

  try {
    await nextApp.prepare();
    log('Next.js prepared successfully');

    // Handle all non-API routes with Next.js
    app.get('*', (req, res) => {
      // Skip API routes - let Express handle them
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API route not found' });
      }
      return handle(req, res);
    });

    return nextApp;
  } catch (error) {
    log('Error setting up Next.js:', String(error));
    throw error;
  }
}