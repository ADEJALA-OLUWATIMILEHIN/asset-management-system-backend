
import express, {NextFunction, Request,Response} from "express";
import sequelize from "./config/sequelize";
import cors from "cors";
import userRouter from "./route/userRouter";
import departmentRouter from "./route/departmentRouter";
import assetRouter from "./route/assetRouter";
import documentRouter from "./route/documentRouter";



const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // or your deployed frontend
  credentials: true
}));




app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to HireLink API");
}
);

app.use("/user", userRouter);
app.use("/department", departmentRouter);
app.use("/asset", assetRouter);
app.use("/document", documentRouter);

const PORT = 3005;

app.listen(PORT, '0.0.0.0', async() => {
  await sequelize.authenticate();
  console.log(`Server is running on port ${PORT}`);
});



