import { ExaminerAnswer } from "../models/AIExaminer.model.js";

export const addanswers = async (req, res)=>{
    try{
        const {questionNumber, correctOption}=req.body;
        const newQuestion = new ExaminerAnswer({questionNumber, correctOption});
        newQuestion.save();
    }catch(err){
        res.json({message:err.message})
    }
};

export const getAnswers = async (req, res)=>{
    try{
        const answers = await ExaminerAnswer.find({}).sort({questionNumber: 1});
        res.json(answers);
    }catch(err){
        res.json({message:err.message})
    }
};

export const updateAnswer = async (req, res)=>{
    try{
        const {id}=req.params;
        const {correctOption}=req.body;
        if(!correctOption){
            return res.json({message:"correct option is required"});
        }

        const updatedQuestion = await ExaminerAnswer.findOneAndUpdate(
            id,
            {correctOption}
        );
        if(!updatedQuestion){
            return res.json({message:"Question not found"});
        }
    }catch(err){
        res.json({message:err.message});
    }
}

export const deleteAnswer = async (req, res)=>{
    try{
        const {id} = req.params;
        const deletedQuestion = await ExaminerAnswer.findByIdAndDelete(id);
        if(!deletedQuestion){
            return res.json({message:"Question not found"});
        }
    }catch(err){
        res.json({message: err.message});
    }
}