import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import todoRoutes from "./routes/todo.route"

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes)
app.use("/api/todos", todoRoutes)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

export default app;