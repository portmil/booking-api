import 'dotenv/config';
import { createApp } from './app';
import { initializeDatabase, closeDatabase } from './database';

async function main() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Create and start the Express app
    const app = createApp();
    const port = parseInt(process.env.PORT || '3000', 10);

    const server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
