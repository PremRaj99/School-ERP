import "dotenv/config"
import { app } from "./app";

import { NODE_ENV, PORT } from "./constant";


app.get("/", (req, res) => {
    res.json({
        success: "true",
        message: "Auth is working"
    })
})

app.listen(PORT, () => {
    console.log(`User Server is running in ${NODE_ENV} environment at http://localhost:${PORT}`);
})