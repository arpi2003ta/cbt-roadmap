import express from "express";

import { addanswers,getAnswers,deleteAnswer,updateAnswer} from "../controllers/examiner.controller.js";
import isAuthenticated, { adminOnly } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/add",isAuthenticated,adminOnly,addanswers);
router.get("/",isAuthenticated,adminOnly,getAnswers);
router.delete("/:id",isAuthenticated,adminOnly,deleteAnswer);
router.post("/:id",isAuthenticated,adminOnly,updateAnswer);

export default router;