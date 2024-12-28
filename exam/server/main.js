import express from "express";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { detect } from "detect-port";
import { initDatabase } from "../../database/database.js";
import { validateRequest } from "../../common/server/authenticator.js";
import apiRouter from "./api.js";
import dbClient from "../../database/database-crud-utils.js";
import { API_RESPONSE } from "../../common/constants/common-constants.js";
import { getQb, setSetPaper } from "./question-bank.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
let PORT = process.env.PRE_EXAM_SERVER_PORT;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../../static/exam"));

app.use(cors());
app.use(cookieParser());
app.use(multer().any());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (request, response, next) => {
  const tokens = {
    dat: request.cookies.dat,
    drt: request.cookies.drt,
  };
  const validationObj = await validateRequest(tokens);
  validationObj.cookies.forEach((cookie) => {
    response.cookie(cookie.key, cookie.value, { maxAge: cookie.maxAge * 1000 });
  });
  request.config = {
    authorized: validationObj.isValid,
    userInfo: validationObj.userInfo,
  };
  if (
    !request.path.startsWith("/js") &&
    !request.path.startsWith("/css") &&
    !request.path.startsWith("/api")
  ) {
    if (
      request.path !== "/" &&
      request.path !== "/register" &&
      !validationObj.isValid
    ) {
      return response.redirect("/");
    }
    if (request.path === "/register" && validationObj.isValid) {
      return response.redirect("/");
    }
  }
  next();
});

app.get("/setExampaper", async (req, res) => {
  let { examid } = req.query;
  await setSetPaper(examid);
});

app.get("/exam/:examId", async (req, res) => {
  const examId = req.params.examId;
  try {
    const { mode, message } = await dbClient.getExamStatus(examId);
    req.config.mode = mode;
    req.config.message = message;
    res.render("index", { config: req.config });
  } catch (error) {
    return res.status(200).json({
      result: API_RESPONSE.FAILURE,
      data: {
        message: "Error fetching exam status",
      },
    });
  }
});

app.get("/", (request, response) => {
  response.render("index", { config: request.config });
});

app.use(express.static(path.join(__dirname, "../../static/exam")));
app.use("/api", apiRouter);

app.get("*", (request, response) => {
  response.render("index", { config: request.config });
});

async function startServer() {
  try {
    await initDatabase();
    detect(PORT, (err, availablePort) => {
      if (err) {
        console.log(err);
        return;
      }

      PORT = process.env.EXAM_SERVER_PORT || availablePort;

      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    });
  } catch (err) {
    console.log(err);
  }
}

startServer();
