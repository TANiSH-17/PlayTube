import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";    
import e from "express";

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// middleware to accept data in json format, no need to use body-parser as express has its own json parser
app.use(express.json({
    limit: "16kb",
}));

// middleware to accept data in urlencoded format
app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}));


// middleware to serve static files(images, favicon) from the public directory
app.use(express.static("public"));

// middleware to parse cookies, cookies are controlled by server only.
app.use(cookieParser());


// import all routes
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);

export default app;