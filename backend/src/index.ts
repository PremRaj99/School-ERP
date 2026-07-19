import { app } from './app';
import { NODE_ENV, PORT } from '@/core/config/constants';
import { setupLogWebSocket } from './modules/log/log.service';

const server = setupLogWebSocket(app);

const initServer = async () => {
  server.listen(PORT, () => {
    console.log(
      `SchoolERP Monolithic Backend Server is running in ${NODE_ENV} environment at http://localhost:${PORT}`,
    );
    console.log(`WebSocket ready at ws://localhost:${PORT}/api/v1/logs/live`);
  });
};

initServer();
