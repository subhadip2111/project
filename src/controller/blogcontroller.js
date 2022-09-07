const BlogModel = require("../model/blogModel")
const AuthorModel = require("../model/authorModel")
const { default: mongoose } = require("mongoose")

const createBlog = async function (req, res) {
    try {
        let blog = req.body
        let authorId = blog.authorId
        if (blog.authorId == null || !authorId) {
            return res.status(404).send({ status: false, msg: "authorid required" });
        }
        if (!mongoose.isValidObjectId(authorId)) {
            return res.status(400).send({
                status: false,
                msg: "Please provide the input"
            })
        }
        /////////////////////////////////////////    title validaton////////////// //////////////////////////////////////
        if ((!blog.title) || (typeof (blog.title) != "string")) {
            return res.status(400).send({
                status: false,
                msg: "Title is Missing or has invali entry"
            })
        }
        //////// validation of body///////
        if (!blog.body || (typeof (blog.body) != "string")) {
            return res.status(400).send({
                status: false,
                msg: "Body is Missing or has invalid entry"
            })
        }


        //validation for tags and catagory and sub catagoryand blog


        if (blog.tags == 0) {
            return res.status(400).send({ blog: "Tags is required!!", status: false });
        }
        if (blog.category == 0) {
            return res.status(400).send({ blog: "Category is required!!", status: false });
        } if (blog.subcategory == 0) {
            return res.status(400).send({ blog: "subCategory is required!!", status: false });
        }




        if (blog.isPublished == true || blog.isPublished == "true") {

            blog.publishedAt = Date.now()
        }

        let blogCreated = await BlogModel.create(blog)
        res.status(201).send({
            status: true,
            msg: blogCreated
        })
    }

    catch (err) {
        console.log("Erorr is from Create Blogs:", err.message)
        res.status(500).send({
            status: false,
            msg: "Error", error: err.message
        })
    }
}


const getBlog = async function (req, res) {
    try {
        const query = req.query

        const blogs = await BlogModel.find({ $and: [query, { isDeleted: true }, { isPublished: false}] })

        if (!blogs) {
            res.status(404).send({ status: false })
        }
        res.status(200).send({ status: true, data: blogs })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const updateBlog = async function (req, res) {
    try {
            const categorys = req.body
            const { title, body, tags, subcategory } = categorys;
           // const data=req.body.tittle
        //let trys=req.params
//if(trys==null){
//     return res.send("userId  is not writen")
// }
        let Id = req.params.blogId;
       // if (!Id) return res.send("userId  is not writen")

      let blogId = mongoose.Types.ObjectId.isValid(Id)
        // if (!Id==true) return res.send("userId  is not writen")
       // if (Id==null) return res.send("userId  is not writen")
        if (blogId == false) return res.send("blogId invalid")
       if(title=== "undifined"){
        return res.send({msg: "title is undifined"})
       }
       if(body=== "undifined"){
        return res.send({msg: "body is undifined"})
       }
       if(tags=== "undifined"){
        return res.send({msg: "tags is undefined"})
       }
       if(subcategory=== "undifined"){
        return res.send({msg: "subcatagory is undefined"})
       }
       
       //return res.send(blog)
       const findValue = await blogModel.findById(Id)
       if(findValue.isDeleted==true){
        return res.status(404).send({msg: " Id is not found"})
       }
       const blog = await blogModel.findByIdAndUpdate ({ _id:Id, isDeleted: false },
        {
            $set: { isPublished: true, body:body, title: title , publishedAt: new Date() },
            $push: { tags:tags, subcategory:subcategory }
        },
        { new: true })
        
        if(!blog){
            return res.status(404).send({msg: "blog is not available"})
        }
        res.send(blog)
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId
        if (!id) {
            res.send({ msg: "id is mandatory" })
        }
        let checkId = await BlogModel.findById(id)
        if (!checkId) {
            res.send({ msg: "id is incorrect" })
        }
        if (checkId.isDeleted == true) {
            res.status(404).send({ status: false, msg: "blog is already deleted" })
        }
        let checkDelete = await BlogModel.updateMany({ _id: id }, { $set: { isDeleted: true } }, { new: true })
        res.status(200).send({ status: true ,data:checkDelete})
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
const deleteBlogByQuery = async function (req, res) {
    try {
        let query = req.query

        if (Object.keys(query).length == 0) {
            return res.status(400).send({ status: false, msg: "Query Params cannot be empty" })
        }

        query.isDeleted = "false" 

        let deleteBlogs = await BlogModel.updateMany(query, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        console.log(deleteBlogs);
        if (deleteBlogs.matchedCount == 0) {
            return res.status(404).send({ status: false, msg: "Blog Not Found" })
        }

        res.status(200).send({ status: true, msg: "Document is deleted" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message })
    }
}





module.exports.createBlog = createBlog

module.exports.getBlog = getBlog

module.exports.updateBlog = updateBlog

module.exports.deleteBlog = deleteBlog

module.exports.deleteBlogByQuery = deleteBlogByQuery