import express from "express";
import { handleSignIn, handleSignUp } from "../../common/server/api-handlers.js";

const router = express.Router();

router.post("/signin", (request, response) => {
    handleSignIn(request, response);
});

router.post("/signup", (request, response) => {
    handleSignUp(request, response);
});

export default router;
