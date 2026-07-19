import { app } from './app';
import { NODE_ENV, PORT } from '@/core/config/constants';

app.listen(PORT, () => {
  console.log(
    `SchoolERP Monolithic Backend Server is running in ${NODE_ENV} environment at http://localhost:${PORT}`,
  );
});
