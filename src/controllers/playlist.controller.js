import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;
    const userId = req.user?._id;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: userId,
        videos: []
    });

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist");
    }

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({owner: userId}).populate("videos", "title thumbnail");

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "username avatar");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to add videos to this playlist");
    }
    
    // Check if the video is already in the playlist
    if (playlist.videos.includes(videoId)) {
         return res.status(200).json(
            new ApiResponse(200, playlist, "Video already exists in the playlist")
        );
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to remove videos from this playlist");
    }

    playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }

    await playlist.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Name is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    playlist.name = name;
    playlist.description = description || playlist.description;
    await playlist.save();
    
    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
