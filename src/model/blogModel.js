const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId


const blogSchema = new mongoose.Schema({ 

    title: {
        type: String,
        required: true, 
        trim: true
    },
    body: {
        type: String,
        required: true, 
        trim: true
    },
    authorId: {
        type: ObjectId,         
        ref: 'authors' 
    },
    tags: [String], 
    category: {
        type: String,
        required: true, 
        trim: true
    },
    subcategory: [String],
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null 
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })
module.exports = mongoose.model('blog', blogSchema)