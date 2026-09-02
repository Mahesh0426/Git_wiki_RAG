import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8001;

//middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

//body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//morgan for logging
app.use(morgan("dev"));

//ingest routes
// app.use("/api/inngest", serve({ client: inngest, functions }));

//sample route
app.get("/", (req, res) => res.send("<h2>App is up</h2>"));

//Routes

//global error handler
// app.use(errorHandler);

// connect DB

app.listen(Number(PORT), "0.0.0.0", (error) => {
  return !error
    ? console.log(`server is running at http://localhost:${PORT}`)
    : console.log(error);
});
