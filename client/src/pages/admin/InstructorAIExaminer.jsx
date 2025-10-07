import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import AddAnswerKeyForm from "@/components/AddAnswerKeyForm";

const InstructorAIExaminer = () => {
  const [omrFile, setOmrFile] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false); // track if upload happened
  const [marks, setMarks] = useState(0);
  const [totalMarks] = useState(20); // Example total marks
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const [added, setAdded]=useState(false);
  const [showAnswerKeyForm, setShowAnswerKeyForm] = useState(false);


  const handleSaveAnswerKey = () => {
    setAdded(true);
    setShowAnswerKeyForm(false); 
  };

  const handleCancel = ()=>{
    setShowAnswerKeyForm(false);
  }
  


  const handleOMRUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setOmrFile(e.target.files[0]);
    }
  };

  const handleCorrectAnswerChange = (e) => {
    setCorrectAnswer(e.target.value);
  };

  const handleUpload = () => {
    if (!omrFile || correctAnswer.trim() === "") {
      toast.error("Please upload an OMR image and enter correct answers.");
      return;
    }

    setLoading(true);

    // Simulate backend processing and api call
    setTimeout(() => {
      setMarks(14); // Example marks
      setWrongAnswers([
        "Q1: Marked B, Correct A",
        "Q3: Marked D, Correct C",
        "Q7: Marked A, Correct D",
        "Q10: Marked C, Correct B",
        "Q12: Marked B, Correct D",
        "Q15: Marked A, Correct B",
      ]);
      setUploaded(true);
      setLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setOmrFile(null);
    setCorrectAnswer("");
    setLoading(false);
    setUploaded(false);
    setMarks(0);
    setWrongAnswers([]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 my-10">
      {/* Top Section */}
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">AI Examiner</h1>
        <Button variant="outline"> <Link to="colleges">Your Colleges</Link>{" "}</Button>
      </div> */}

      {/* Upload Card (always visible) */}
      <div className="my-8">
        <Card>
          <CardHeader>
            <CardTitle>NEET Question</CardTitle>
            <CardDescription>
              Upload the Neet question paper
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="omr">Upload NEET Questions</Label>
              <Input
                id="omr"
                type="file"
                accept="image/*"
                onChange={handleOMRUpload}
                disabled={uploaded}
              />
              {omrFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {omrFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Answer Key</Label>
              <div className="border rounded-md p-4 min-h-[100px] flex flex-col justify-between">
                <div className="flex justify-center">
                    <p className="text-sm text-muted-foreground">{added?"Answer Key Added":"No Answer Key added till now"}</p>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={()=>setShowAnswerKeyForm(true)}>
                    Add Answer Key
                  </Button>
                  <Button variant="outline"  onClick={()=>setShowAnswerKeyForm(true)}>
                    Edit Question
                  </Button>
                </div>

              </div>
            </div>
          </CardContent>

          {/* <CardFooter>
            <Button onClick={handleUpload} disabled={loading || uploaded}>
              {loading ? "Uploading..." : uploaded ? "Uploaded" : "Upload"}
            </Button>
          </CardFooter> */}
        </Card>
      </div>
      {showAnswerKeyForm && (
        <AddAnswerKeyForm onSave={handleSaveAnswerKey} onCancel={handleCancel}/>
      )}

    </div>
  );
};

export default InstructorAIExaminer;
