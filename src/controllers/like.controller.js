import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the user has already liked the video
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // If like exists, remove it (unlike)
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed successfully"));
    } else {
        // If like does not exist, add it (like)
        await Like.create({
            video: videoId,
            likedBy: userId,
        });
        return res.status(201).json(new ApiResponse(201, { isLiked: true }, "Like added successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed successfully"));
    } else {
        await Like.create({
            comment: commentId,
            likedBy: userId,
        });
        return res.status(201).json(new ApiResponse(201, { isLiked: true }, "Like added successfully"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed successfully"));
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId,
        });
        return res.status(201).json(new ApiResponse(201, { isLiked: true }, "Like added successfully"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate({
            path: 'video',
            populate: {
                path: 'owner',
                select: 'username avatar'
            }
        });

    if (!likedVideos || likedVideos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "User has no liked videos"));
    }
    
    // Extract the video documents from the like documents
    const videos = likedVideos.map(like => like.video);

    return res.status(200).json(
        new ApiResponse(200, videos, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
