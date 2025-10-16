import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";

// Advanced AI Search Algorithm with multiple scoring mechanisms
export const aiSearchCourses = async (req, res) => {
    try {
        const { query, category, level, minPrice, maxPrice, sortBy = 'relevance' } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters long"
            });
        }

        // Build search pipeline
        const searchPipeline = buildSearchPipeline(query, {
            category,
            level,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
        });

        // Execute search with aggregation pipeline
        const courses = await Course.aggregate(searchPipeline);

        // Handle empty results
        if (!courses || courses.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No courses found matching your search criteria",
                data: {
                    courses: [],
                    totalResults: 0,
                    searchQuery: query,
                    insights: {
                        summary: "No courses found matching your search criteria",
                        suggestions: [
                            "Try using broader search terms",
                            "Check your spelling",
                            "Remove filters to see more results"
                        ]
                    },
                    suggestions: []
                }
            });
        }

        // Apply AI-powered relevance scoring
        const scoredCourses = applyAIScoring(courses, query);

        // Sort results based on preference
        const sortedCourses = sortResults(scoredCourses, sortBy);

        // Generate search insights
        const insights = generateSearchInsights(sortedCourses, query);

        return res.status(200).json({
            success: true,
            message: `Found ${sortedCourses.length} courses matching your search`,
            data: {
                courses: sortedCourses,
                totalResults: sortedCourses.length,
                searchQuery: query,
                insights,
                suggestions: generateSearchSuggestions(query, sortedCourses)
            }
        });

    } catch (error) {
        console.error("AI Search Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to perform AI search"
        });
    }
};

// Build MongoDB aggregation pipeline for initial search
const buildSearchPipeline = (query, filters) => {
    const pipeline = [];

    // Match only published courses
    const matchStage = {
        isPublished: true
    };

    // Add category filter
    if (filters.category) {
        matchStage.category = { $regex: filters.category, $options: 'i' };
    }

    // Add level filter
    if (filters.level) {
        matchStage.courseLevel = filters.level;
    }

    // Add price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        matchStage.coursePrice = {};
        if (filters.minPrice !== undefined) matchStage.coursePrice.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) matchStage.coursePrice.$lte = filters.maxPrice;
    }

    pipeline.push({ $match: matchStage });

    // Populate creator and lectures
    pipeline.push(
        {
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creator',
                pipeline: [{ $project: { name: 1, photoUrl: 1 } }]
            }
        },
        {
            $lookup: {
                from: 'lectures',
                localField: 'lectures',
                foreignField: '_id',
                as: 'lectures',
                pipeline: [{ $project: { lectureTitle: 1, isPreviewFree: 1 } }]
            }
        },
        {
            $unwind: {
                path: '$creator',
                preserveNullAndEmptyArrays: true
            }
        }
    );

    // Add text search scoring
    pipeline.push({
        $addFields: {
            searchableText: {
                $concat: [
                    { $ifNull: ['$courseTitle', ''] }, ' ',
                    { $ifNull: ['$subTitle', ''] }, ' ',
                    { $ifNull: ['$description', ''] }, ' ',
                    { $ifNull: ['$category', ''] }, ' ',
                    { $ifNull: ['$courseLevel', ''] }, ' ',
                    { $ifNull: ['$creator.name', ''] }
                ]
            },
            enrolledCount: { $size: { $ifNull: ['$enrolledStudents', []] } },
            lectureCount: { $size: { $ifNull: ['$lectures', []] } }
        }
    });

    return pipeline;
};

// Advanced AI Scoring Algorithm
const applyAIScoring = (courses, query) => {
    const queryTerms = preprocessQuery(query);
    
    if (!courses || courses.length === 0) {
        return [];
    }
    
    return courses.map(course => {
        let totalScore = 0;
        const scoreBreakdown = {};

        // 1. Exact Title Match (40% weight)
        const titleScore = calculateSimilarity(course.courseTitle, query) * 0.4;
        scoreBreakdown.titleMatch = titleScore;
        totalScore += titleScore;

        // 2. Subtitle Match (25% weight)
        const subtitleScore = calculateSimilarity(course.subTitle || '', query) * 0.25;
        scoreBreakdown.subtitleMatch = subtitleScore;
        totalScore += subtitleScore;

        // 3. Description Relevance (20% weight)
        const descriptionScore = calculateDescriptionRelevance(course.description || '', queryTerms) * 0.2;
        scoreBreakdown.descriptionRelevance = descriptionScore;
        totalScore += descriptionScore;

        // 4. Category Match (10% weight)
        const categoryScore = calculateSimilarity(course.category, query) * 0.1;
        scoreBreakdown.categoryMatch = categoryScore;
        totalScore += categoryScore;

        // 5. Popularity Boost (5% weight)
        const popularityScore = calculatePopularityScore(course.enrolledCount, course.lectureCount) * 0.05;
        scoreBreakdown.popularityBoost = popularityScore;
        totalScore += popularityScore;

        // 6. Lecture Content Analysis
        const lectureScore = analyzeLectureContent(course.lectures, queryTerms);
        scoreBreakdown.lectureRelevance = lectureScore;
        totalScore += lectureScore;

        // 7. Semantic Similarity (Advanced NLP-like approach)
        const semanticScore = calculateSemanticSimilarity(course, queryTerms);
        scoreBreakdown.semanticSimilarity = semanticScore;
        totalScore += semanticScore;

        return {
            ...course,
            aiScore: Math.min(totalScore, 1), // Cap at 1.0
            scoreBreakdown,
            relevancePercentage: Math.round(totalScore * 100),
            matchedTerms: findMatchedTerms(course, queryTerms)
        };
    });
};

// Query preprocessing for better matching
const preprocessQuery = (query) => {
    if (!query || typeof query !== 'string') return [];
    
    return query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove special characters
        .split(/\s+/)
        .filter(term => term && term.length > 1) // Remove short/empty words
        .map(term => term.trim())
        .filter(term => term.length > 0);
};

// Advanced similarity calculation using multiple algorithms
const calculateSimilarity = (text1, text2) => {
    if (!text1 || !text2 || typeof text1 !== 'string' || typeof text2 !== 'string') return 0;
    
    const str1 = text1.toString().toLowerCase();
    const str2 = text2.toString().toLowerCase();

    // Exact match bonus
    if (str1.includes(str2) || str2.includes(str1)) {
        return 1.0;
    }

    // Word overlap calculation
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    let commonWords = 0;
    words2.forEach(word => {
        if (words1.some(w => w.includes(word) || word.includes(w))) {
            commonWords++;
        }
    });

    const overlapScore = commonWords / Math.max(words1.length, words2.length);
    
    // Levenshtein distance for fuzzy matching
    const levenshteinScore = 1 - (levenshteinDistance(str1, str2) / Math.max(str1.length, str2.length));
    
    return Math.max(overlapScore, levenshteinScore * 0.7);
};

// Levenshtein distance algorithm for fuzzy string matching
const levenshteinDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

// Description relevance analysis
const calculateDescriptionRelevance = (description, queryTerms) => {
    if (!description || !queryTerms || queryTerms.length === 0 || typeof description !== 'string') return 0;

    const descriptionWords = description.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (descriptionWords.length === 0) return 0;
    
    let relevanceScore = 0;

    queryTerms.forEach(term => {
        const termMatches = descriptionWords.filter(word => 
            word.includes(term) || term.includes(word)
        ).length;
        relevanceScore += termMatches / descriptionWords.length;
    });

    return Math.min(relevanceScore, 1);
};

// Popularity scoring based on enrollment and content
const calculatePopularityScore = (enrolledCount, lectureCount) => {
    const safeEnrolledCount = Math.max(0, enrolledCount || 0);
    const safeLectureCount = Math.max(0, lectureCount || 0);
    
    const enrollmentScore = Math.min(safeEnrolledCount / 100, 1); // Max at 100 students
    const contentScore = Math.min(safeLectureCount / 20, 1); // Max at 20 lectures
    return (enrollmentScore * 0.7) + (contentScore * 0.3);
};

// Lecture content analysis
const analyzeLectureContent = (lectures, queryTerms) => {
    if (!lectures || lectures.length === 0 || !queryTerms || queryTerms.length === 0) return 0;

    let totalScore = 0;
    lectures.forEach(lecture => {
        if (lecture && lecture.lectureTitle && typeof lecture.lectureTitle === 'string') {
            const titleScore = queryTerms.reduce((score, term) => {
                return score + (lecture.lectureTitle.toLowerCase().includes(term) ? 1 : 0);
            }, 0);
            totalScore += titleScore / queryTerms.length;
        }
    });

    return Math.min(totalScore / lectures.length, 0.1); // Max 10% contribution
};

// Semantic similarity using keyword associations
const calculateSemanticSimilarity = (course, queryTerms) => {
    if (!course || !queryTerms || queryTerms.length === 0) return 0;
    
    const techKeywords = {
        'programming': ['coding', 'development', 'software', 'computer', 'tech'],
        'web': ['html', 'css', 'javascript', 'react', 'frontend', 'backend'],
        'data': ['analytics', 'science', 'machine learning', 'ai', 'statistics'],
        'design': ['ui', 'ux', 'graphic', 'creative', 'visual'],
        'business': ['management', 'marketing', 'finance', 'entrepreneurship'],
        'language': ['english', 'communication', 'writing', 'speaking']
    };

    let semanticScore = 0;
    const courseText = `${course.courseTitle || ''} ${course.subTitle || ''} ${course.description || ''} ${course.category || ''}`.toLowerCase();

    queryTerms.forEach(term => {
        Object.entries(techKeywords).forEach(([category, keywords]) => {
            if (term.includes(category) || keywords.some(keyword => term.includes(keyword))) {
                if (keywords.some(keyword => courseText.includes(keyword)) || courseText.includes(category)) {
                    semanticScore += 0.1;
                }
            }
        });
    });

    return Math.min(semanticScore, 0.2); // Max 20% contribution
};

// Find matched terms for highlighting
const findMatchedTerms = (course, queryTerms) => {
    if (!course || !queryTerms || queryTerms.length === 0) return [];
    
    const courseText = `${course.courseTitle || ''} ${course.subTitle || ''} ${course.description || ''}`.toLowerCase();
    return queryTerms.filter(term => term && courseText.includes(term));
};

// Sort results based on different criteria
const sortResults = (courses, sortBy) => {
    if (!courses || courses.length === 0) return [];
    
    switch (sortBy) {
        case 'price_low':
            return courses.sort((a, b) => (a.coursePrice || 0) - (b.coursePrice || 0));
        case 'price_high':
            return courses.sort((a, b) => (b.coursePrice || 0) - (a.coursePrice || 0));
        case 'popularity':
            return courses.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
        case 'newest':
            return courses.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            });
        case 'relevance':
        default:
            return courses.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    }
};

// Generate search insights
const generateSearchInsights = (courses, query) => {
    if (!courses || courses.length === 0) {
        return {
            summary: "No courses found matching your search criteria",
            suggestions: [
                "Try using broader search terms",
                "Check your spelling",
                "Remove filters to see more results"
            ]
        };
    }

    const validCourses = courses.filter(course => course && typeof course === 'object');
    if (validCourses.length === 0) {
        return {
            summary: "No valid courses found",
            suggestions: ["Please try again with different search terms"]
        };
    }

    const avgPrice = validCourses.reduce((sum, course) => sum + (course.coursePrice || 0), 0) / validCourses.length;
    const levels = [...new Set(validCourses.map(course => course.courseLevel).filter(Boolean))];
    const categories = [...new Set(validCourses.map(course => course.category).filter(Boolean))];
    const topMatch = validCourses[0];

    return {
        summary: `Found ${validCourses.length} relevant courses with ${Math.round(topMatch?.relevancePercentage || 0)}% match`,
        averagePrice: Math.round(avgPrice),
        availableLevels: levels,
        popularCategories: categories.slice(0, 5),
        topMatchTitle: topMatch?.courseTitle || 'Unknown',
        recommendations: validCourses.slice(0, 3).map(course => ({
            title: course?.courseTitle || 'Unknown',
            relevance: course?.relevancePercentage || 0,
            reason: getRecommendationReason(course, query)
        }))
    };
};

// Generate recommendation reasons
const getRecommendationReason = (course, query) => {
    if (!course || !course.scoreBreakdown) return "Good overall match";
    
    const breakdown = course.scoreBreakdown;
    const reasons = [];

    if (breakdown.titleMatch > 0.3) reasons.push("Strong title match");
    if (breakdown.descriptionRelevance > 0.2) reasons.push("Relevant content");
    if (breakdown.popularityBoost > 0.03) reasons.push("Popular among students");
    if (course.matchedTerms && course.matchedTerms.length > 0) {
        reasons.push(`Matches: ${course.matchedTerms.join(', ')}`);
    }

    return reasons.join(" • ") || "Good overall match";
};

// Generate search suggestions
const generateSearchSuggestions = (query, results) => {
    if (!query || typeof query !== 'string') return [];
    
    const suggestions = [];
    
    if (results && results.length > 0) {
        // Suggest related categories
        const categories = [...new Set(results.map(r => r?.category).filter(Boolean))];
        suggestions.push(...categories.map(cat => `${query} in ${cat}`));
        
        // Suggest related levels
        const levels = [...new Set(results.map(r => r?.courseLevel).filter(Boolean))];
        suggestions.push(...levels.map(level => `${level} ${query}`));
    }

    // Add common search refinements
    const refinements = [
        `${query} tutorial`,
        `${query} beginner`,
        `${query} advanced`,
        `${query} course`,
        `learn ${query}`
    ];
    
    suggestions.push(...refinements);
    
    return [...new Set(suggestions)].slice(0, 5); // Remove duplicates and limit
};

// Auto-complete search suggestions
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(200).json({
                success: true,
                suggestions: []
            });
        }

        // Get suggestions from course titles, categories, and descriptions
        const suggestions = await Course.aggregate([
            {
                $match: {
                    isPublished: true,
                    $or: [
                        { courseTitle: { $regex: q, $options: 'i' } },
                        { category: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    courseTitle: 1,
                    category: 1,
                    _id: 0
                }
            },
            { $limit: 10 }
        ]);

        const uniqueSuggestions = [...new Set([
            ...suggestions.map(s => s.courseTitle).filter(Boolean),
            ...suggestions.map(s => s.category).filter(Boolean)
        ])].filter(suggestion => suggestion && suggestion.length > 0).slice(0, 8);

        return res.status(200).json({
            success: true,
            suggestions: uniqueSuggestions
        });

    } catch (error) {
        console.error("Suggestion Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get suggestions"
        });
    }
};

// Search analytics endpoint
export const getSearchAnalytics = async (req, res) => {
    try {
        const analytics = await Course.aggregate([
            {
                $match: { isPublished: true }
            },
            {
                $group: {
                    _id: "$category",
                    courseCount: { $sum: 1 },
                    averagePrice: { $avg: "$coursePrice" },
                    totalEnrollments: { $sum: { $size: "$enrolledStudents" } }
                }
            },
            { $sort: { courseCount: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get analytics"
        });
    }
};
