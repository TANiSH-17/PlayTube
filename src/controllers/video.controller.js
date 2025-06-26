import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"; // Assuming a delete function exists

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType = 'desc', userId } = req.query;

    // Create an aggregation pipeline
    const pipeline = [];

    // Match stage for filtering
    const matchStage = {};
    if (query) {
        // Basic text search on title and description
        matchStage.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    
    // Only fetch published videos
    matchStage.isPublished = true;

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    pipeline.push({ $match: matchStage });

    // Sort stage
    const sortStage = {};
    if (sortBy && (sortType === 'asc' || sortType === 'desc')) {
        sortStage[sortBy] = sortType === 'asc' ? 1 : -1;
    } else {
        // Default sort by creation date
        sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });

    // Using mongoose-aggregate-paginate-v2 for pagination
    // This simplifies pagination with aggregation pipelines
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    if (!videos || videos.docs.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No videos found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    // Get file paths from multer
    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    // Upload to Cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Failed to upload files to Cloudinary");
    }

    // Create video document
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration, // Assuming cloudinary response has duration
        owner: req.user?._id, // Assuming user is available in req
        isPublished: true
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video || !video.isPublished) {
        throw new ApiError(404, "Video not found");
    }

    // Increment view count
    video.views += 1;
    await video.save({ validateBeforeSave: false });

    // Populate owner details for the response
    const videoWithOwner = await Video.findById(videoId).populate("owner", "username avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, videoWithOwner, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path; // For single file upload with key 'thumbnail'

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    let newThumbnailUrl = null;
    if (thumbnailLocalPath) {
        // TODO: Optionally delete the old thumbnail from cloudinary
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!newThumbnail?.url) {
            throw new ApiError(500, "Failed to upload new thumbnail");
        }
        updateData.thumbnail = newThumbnail.url;
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Delete files from Cloudinary
    // Note: You need a utility to extract public_id from the URL
    // and a function in cloudinary.js to delete assets.
    // await deleteFromCloudinary(video.videoFile);
    // await deleteFromCloudinary(video.thumbnail);

    // Delete the video document from MongoDB
    await Video.findByIdAndDelete(videoId);
    
    // TODO: Also delete associated likes and comments from other collections.
    // This can be handled efficiently with Mongoose middleware on the Video schema.

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to change the publish status");
    }
    
    // Toggle the status and save
    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { isPublished: video.isPublished }, "Publish status toggled successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};