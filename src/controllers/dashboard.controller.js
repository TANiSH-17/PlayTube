import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the user ID from the authenticated user
    const userId = req.user?._id;

    // Get total number of videos uploaded by the channel
    const totalVideos = await Video.countDocuments({ owner: userId });

    // Get total number of subscribers to the channel
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    // Get total views on all videos of the channel using an aggregation pipeline
    const totalViewsResult = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null, // Group all documents into one
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;
    
    // Get total likes on all videos of the channel
    // First, get all video IDs for the channel
    const videos = await Video.find({ owner: userId }).select('_id');
    const videoIds = videos.map(video => video._id);
    
    // Then, count the likes for those videos
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    // Construct the response object
    const stats = {
        totalVideos,
        totalSubscribers,
        totalViews,
        totalLikes
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get the user ID from the authenticated user
    const userId = req.user?._id;

    // Get all videos uploaded by the channel, sorted by the newest first
    const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

    if (!videos || videos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No videos found for this channel"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
}
