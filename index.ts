
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

import express, {NextFunction, Request,Response} from "express";
import sequelize from "./config/sequelize";
import cors from "cors";
import userRouter from "./route/userRouter";
import departmentRouter from "./route/departmentRouter";
import assetRouter from "./route/assetRouter";
import documentRouter from "./route/documentRouter";
import maintenanceRouter from "./route/maintenanceRouter";
import calendarRouter from "./route/calendarRouter";
import staffRouter from "./route/staffRouter";



const app = express();
const uploadDir = path.resolve(__dirname, "uploads");

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // or your deployed frontend
  credentials: true
}));

app.use(express.json());        // 👈 parses application/json
app.use(express.urlencoded({ extended: true })); //
app.use("/uploads", express.static(uploadDir));


app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to HireLink API");
}
);

app.use("/user", userRouter);
app.use("/department", departmentRouter);
app.use("/asset", assetRouter);
app.use("/document", documentRouter);
app.use("/maintenance", maintenanceRouter);
app.use("/calendar", calendarRouter);
app.use("/staff", staffRouter);

const PORT = 3005;

app.listen(PORT, '0.0.0.0', async() => {
  await sequelize.authenticate();
  console.log(`Server is running on port ${PORT}`);
});



