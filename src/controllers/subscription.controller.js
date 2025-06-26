import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    try {
        const channel = await User.findById(channelId);

        if (!channel) {
            throw new ApiError(404, "Channel not found");
        }

        const subscription = await Subscription.findOne({
            subscriber: userId,
            channel: channelId,
        });

        if (subscription) {
            // Unsubscribe
            await subscription.deleteOne();
            return res
                .status(200)
                .json(new ApiResponse(200, null, "Unsubscribed successfully"));
        } else {
            // Subscribe
            const newSubscription = new Subscription({
                subscriber: userId,
                channel: channelId,
            });
            await newSubscription.save();
            return res
                .status(201)
                .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
        }
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error in toggleSubscription");
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    try {
        const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "username avatar");

        if (!subscribers) {
            return res.status(200).json(new ApiResponse(200, [], "No subscribers found for this channel"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error in getUserChannelSubscribers");
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    try {
        const subscribedChannels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "username avatar");

        if (!subscribedChannels) {
            return res.status(200).json(new ApiResponse(200, [], "User has not subscribed to any channels"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error in getSubscribedChannels");
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}