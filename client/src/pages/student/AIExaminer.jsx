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

const AIExaminer = () => {
  const [omrFile, setOmrFile] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false); // track if upload happened
  const [marks, setMarks] = useState(0);
  const [totalMarks] = useState(20); // Example total marks
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const handleOMRUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setOmrFile(e.target.files[0]);
    }
  };

  const handleCorrectAnswerChange = (e) => {
    setCorrectAnswer(e.target.value);
  };

  const handleUpload = () => {
    if (!omrFile) {
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
        "Q16: Marked B, Correct D",
        "Q26: Marked B, Correct D",
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">AI Examiner</h1>
        <Button variant="outline"> <Link to="colleges">Your Colleges</Link>{" "}</Button>
      </div>

      {/* Upload Card (always visible) */}
      <div className="my-8">
        <Card>
          <CardHeader>
            <CardTitle>OMR Upload</CardTitle>
            <CardDescription>
              Upload the scanned OMR image and enter the correct answers below.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="omr">Upload OMR Image</Label>
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

            {/* <div className="space-y-1">
              <Label htmlFor="correctAnswer">Enter Correct Answer</Label>
              <Textarea
                id="correctAnswer"
                value={correctAnswer}
                onChange={handleCorrectAnswerChange}
                placeholder="Eg: ACBDBACD..."
                disabled={uploaded}
              />
              <p className="text-sm text-muted-foreground">
                Character Count: {correctAnswer.length}
              </p>
            </div> */}
          </CardContent>

          <CardFooter>
            <Button onClick={handleUpload} disabled={loading || uploaded}>
              {loading ? "Uploading..." : uploaded ? "Uploaded" : "Upload"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Results (only if uploaded) */}
      {uploaded && (
        <div className="space-y-6 mt-10">
          {/* Marks */}
          <Card>
            <CardHeader>
              <CardTitle>Result Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                Marks: <strong>{marks}</strong>/<strong>{totalMarks}</strong>
              </p>
            </CardContent>
          </Card>

          {/* Wrong Answers */}
          <Card className="max-h-64 overflow-y-auto">
            <CardHeader>
              <CardTitle>Wrong Answers</CardTitle>
            </CardHeader>
            <CardContent>
              {wrongAnswers.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm ">
                  {wrongAnswers.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">All answers are correct!</p>
              )}
            </CardContent>
          </Card>

          {/* Reset */}
          <div className="flex justify-center mt-4">
            <Button onClick={handleReset}>Submit Another</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIExaminer;
