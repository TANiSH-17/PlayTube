import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, 
    {
        timestamps: true
    }
);

// This plugin is necessary for the pagination functionality used in your controller
commentSchema.plugin(mongooseAggregatePaginate);

// The 'export default' is crucial here. It makes sure that when you import this file,
// you get the Comment model directly.
export default mongoose.model("Comment", commentSchema);
