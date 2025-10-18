import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import {Button, buttonVariants} from '@/components/ui/button'
import { useState } from "react";
import apiClient from "@/api/axios";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Rating } from 'primereact/rating';
import { useEffect } from "react";
const Review = ()=>{
    const {courseId}=useParams();
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(null);
    const [allReviews, setAllReviews]=useState([]);
    const [visibleCount, setVisibleCount]=useState(3);
    
    console.log(allReviews);
    const fetchReviews=async()=>{
        try{
            const getResponse = await apiClient.get(`/course/${courseId}/review`);
            setAllReviews(getResponse.data.reviews);
            console.log(getResponse.data.reviews);
        }catch(err){
            console.error(err.message);
        }
    }
    useEffect(()=>{
        fetchReviews();
    },[])

    const addComment=async()=>{
        try{
            const postResponse = await apiClient.post(`/course/${courseId}/review`,{ comment, rating });

            if (!postResponse||!postResponse.data){
                toast.error("failed to post comment");
                return
            }else{
                toast.success("comment added");
                setComment("");
                setRating(null);
                fetchReviews();
            }

        }catch(err){
            console.log(err.message);
            toast.error(err.response?.data?.message || err.message);
        }
    }

    const showMoreComment=()=>{
        try{
            setVisibleCount((prev)=>prev+3);
        }catch(err){
            toast.error("No more review found");
        }
    }
    return <div className="bg-white dark:bg-[#020817] flex  items-center justify-center  ">
        <Card className="shadow-none max-w-7xl mx-auto my-5 px-4 border-none flex flex-col justify-between w-full">
            <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>Share your thoughts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-6">
                <span className="bg-gray-300 dark:bg-[#020817] p-1 max-w-40 rounded-2xl">
                    <Rating value={rating} onChange={(e) => setRating(e.value)} cancel={true} />
                </span>
                <Input className="min-h-16" placeholder="Write your comments here!" name="comment" value={comment} onChange={(e) => setComment(e.target.value)}></Input>
            </CardContent>
            <div className="ml-6">
                <Button onClick={addComment}>Submit Review</Button>
            </div>
            <CardHeader>
                <CardTitle>Student Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {allReviews && allReviews.length>0?(allReviews.slice().reverse().slice(0,visibleCount).map(review=>(<div className="font-semibold flex flex-col justify-end space-y-2">
                    <div className="font-bold flex flex-col justify-end">{review.user.name}
                        <div><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt),{addSuffix:true}).replace("about","")}</p></div>
                    </div>
                    <span className="bg-gray-300 dark:bg-[#020817] p-1 max-w-[132px] rounded-2xl">
                        <Rating readOnly value={review.rating} cancel={false}/>
                    </span>
                    
                    <div className="font-normal">{review.comment}</div>
                </div>))):(<p className="font-light">no review posted yet</p>)}
                {allReviews.length>visibleCount &&(<div>
                    <Button variant="outline" size="lg" className="border-4 border-black dark:border-white" onClick={showMoreComment}>See More Reviews</Button>
                </div>)}
            </CardContent>
        </Card>
    </div>
}
export default Review;