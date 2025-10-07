import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateStudyRoadmap = async (roadmapData) => {
    try {
        const {
            examType,
            currentMarks,
            sectionWiseMarks,
            targetScore,
            attemptNumber,
            preferences,
            studyStyle
        } = roadmapData;

        // Calculate score gap and improvement needed
        const scoreGap = targetScore - currentMarks;
        const subjects = examType === 'NEET' 
            ? ['Physics', 'Chemistry', 'Biology']
            : ['Physics', 'Chemistry', 'Mathematics'];

        // Build the prompt
        const prompt = `You are an expert academic counselor for ${examType} exam preparation in India. Create a personalized study roadmap based on the following student data:

**Current Performance:**
- Overall Score: ${currentMarks}/${examType === 'NEET' ? '720' : '300'}
- Physics: ${sectionWiseMarks.physics}
- Chemistry: ${sectionWiseMarks.chemistry}
${examType === 'NEET' ? `- Biology: ${sectionWiseMarks.biology}` : `- Mathematics: ${sectionWiseMarks.mathematics}`}

**Goals:**
- Target Score: ${targetScore}
- Score Improvement Needed: ${scoreGap} marks
- Attempt Number: ${attemptNumber}

**Student Preferences:**
- Favorite Subjects: ${preferences.join(', ')}
- Preferred Study Times: ${studyStyle.join(', ')}

Please provide a structured JSON response with the following format (respond ONLY with valid JSON, no markdown or extra text):

{
  "subjectPriority": [
    {
      "subject": "Subject Name",
      "priority": 1,
      "focus": "Brief description of what needs focus"
    }
  ],
  "studyTimeAllocation": [
    {
      "subject": "Subject Name",
      "hoursPerDay": 2.5,
      "activities": ["Activity 1", "Activity 2"]
    }
  ],
  "weeklyFocusCycle": [
    {
      "weeks": "Week 1-3",
      "focus": ["Focus area 1", "Focus area 2"]
    }
  ],
  "milestoneGoals": [
    {
      "timeline": "After 1 month",
      "targetScore": 250
    }
  ],
  "additionalRecommendations": ["Recommendation 1", "Recommendation 2"]
}

**Important Instructions:**
1. Prioritize subjects based on current weaknesses and improvement potential
2. Allocate realistic daily study hours based on preferred study times
3. Create a 12-week study cycle with clear focus areas
4. Set milestone goals at 1 month, 2 months, and final phase
5. Provide 3-5 actionable recommendations
6. Consider the attempt number - if it's 2nd or 3rd attempt, focus on weak areas more aggressively
7. Respond ONLY with the JSON object, no additional text`;

        // Make API call to Gemini
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract the generated text
        const generatedText = response.data.candidates[0].content.parts[0].text;
        
        // Clean the response - remove markdown code blocks if present
        let cleanedText = generatedText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        // Parse JSON response
        const roadmap = JSON.parse(cleanedText);

        return {
            success: true,
            roadmap
        };

    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        
        // If JSON parsing fails, return a fallback error
        if (error instanceof SyntaxError) {
            return {
                success: false,
                error: 'Failed to parse AI response. Please try again.'
            };
        }

        return {
            success: false,
            error: error.response?.data?.error?.message || 'Failed to generate roadmap. Please try again.'
        };
    }
};