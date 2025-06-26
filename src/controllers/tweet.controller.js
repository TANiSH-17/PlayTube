import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // Get content from the request body
    const { content } = req.body;
    
    // The user's ID is available from the 'auth' middleware
    const userId = req.user?._id;

    // Validate that content is not empty
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    // Create a new tweet object
    const tweet = new Tweet({
        content,
        owner: userId,
    });

    // Save the tweet to the database
    await tweet.save();

    // Fetch the created tweet with owner details populated
    const createdTweet = await Tweet.findById(tweet._id).populate("owner", "username avatar");

    if (!createdTweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet");
    }
    
    // Return a success response with the created tweet data
    return res.status(201).json(
        new ApiResponse(201, createdTweet, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    // Get userId from the request parameters
    const { userId } = req.params;

    // Validate if the userId is a valid MongoDB ObjectId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Find all tweets by the specified owner
    // We can add pagination here later if needed
    const tweets = await Tweet.find({ owner: userId })
        .populate("owner", "username avatar")
        .sort({ createdAt: -1 }); // Sort by newest first

    // Check if the user exists by checking if tweets are found or querying the user model
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Return the tweets in the response
    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    // Get tweetId from params and new content from body
    const { tweetId } = req.params;
    const { content } = req.body;

    // Validate the tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Validate the new content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty");
    }

    // Find the tweet to be updated
    const tweet = await Tweet.findById(tweetId);

    // If tweet does not exist, throw an error
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the requesting user is the owner of the tweet
    // `tweet.owner` is an ObjectId, so we convert it to a string for comparison
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    
    // Update the tweet content and save it
    tweet.content = content;
    await tweet.save();

    // Fetch the updated tweet with owner details populated
    const updatedTweet = await Tweet.findById(tweetId).populate("owner", "username avatar");

    // Return the updated tweet
    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    // Get tweetId from the request parameters
    const { tweetId } = req.params;

    // Validate the tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Find the tweet to be deleted
    const tweet = await Tweet.findById(tweetId);

    // If the tweet doesn't exist, throw a 404 error
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Verify that the user requesting the delete is the owner of the tweet
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    
    // Delete the tweet from the database
    await tweet.deleteOne();

    // Return a success response
    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
