import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lawsRoutes from "./routes/lawsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* HEALTH CHECK */

app.get("/", (_req, res) => {
  res.status(200).json({ message: "CivicRoute backend is running." });
});

/* API ROUTES */

app.use("/api", lawsRoutes);
app.use("/api", aiRoutes);

/* SERVER */

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});