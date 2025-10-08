import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionNumber: {type: Number, required:true},
    correctOption: {type:String, enum: ['A','B','C','D'], required:true}
});

export const ExaminerAnswer = mongoose.model("ExaminerAnswer",answerSchema);
