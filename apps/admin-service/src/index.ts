import { app } from "./app";

import { NODE_ENV, PORT } from "./constant";

app.listen(PORT, () => {
    console.log(`Admin Server is running in ${NODE_ENV} environment at http://localhost:${PORT}`);
})