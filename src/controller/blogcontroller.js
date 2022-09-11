const blogModel = require("../model/blogModel")
const mongoose = require("mongoose")
const { details, validId } = require("../validation/validators");


// const isValidRequestBody = function(requestbody){
//     return Object.keys(requestbody).length>0
// }
const createBlog = async function (req, res) {
    try {
    let blog = req.body
    let authorId = blog.authorId
    if (blog.authorId == null || !authorId) {return res.status(404).send({ status: false, msg: "Author Id must be required"});}

    if (!validId(blog.authorId)) {return res.status(400).send({status: false,msg: "Id is not valid"})}

    // if(isValidRequestBody(blog)){
    //     return res.send({msg: "data field is required" })
    //  }
    const { body,title,category,tags,subcategory} = blog


     if(body === "undifined" || body==null || typeof(title)!='string') return res.status(404).send("Body is required")
     if(title === "undifined" || title==null || typeof(title)!='string') return res.status(404).send("Title is required")
     if(category === "undifined" || category==null) return res.status(404).send("Category is required")

 if(tags){
     if (!details(tags)) {                       /// its use for tag of list in array string 
        return res.status(404).send({ status: false, msg: "please input valid tags" })
    }}
    
if(subcategory){
    if (!details(subcategory)) {                       /// its use for subcategory of list in array string 
        return res.status(404).send({ status: false, msg: "please input valid subcategory" })
    }}

    let blogCreated = await blogModel.create(blog)
    res.status(201).send({status: true,
            data: blogCreated})
    
    }
catch (err) {console.log("Erorr is from Create Blogs:", err.message)
         res.status(500).send({status: false, msg: "Error", error: err.message})}
 }

//--------------------------------------------------getblog----------------------------------------------------

const getBlog = async function (req, res) {
    try {
        const query = req.query
        
        query.isDeleted = false
        query.isPublished = true
        //console.log(query.authorId)
        if(Object.keys(query).some(x=>x=="authorId")){
        if(!query.authorId){return res.status(404).send({msg: "please provide author id"})}
                if (!validId(query.authorId)) {
                    return res.status(400).send({
                        status: false,
                        msg: "Invalid author id"
                    })
                }
            }
        const blogs = await blogModel.find(query)
        if(blogs.length==0){return res.status(404).send({msg: "no data found"})}
        res.status(200).send(blogs)
        

        // if (!query.isDeleted || query.isDeleted == "undefined") {
        //     return res.status(200).send({ status: true, msg: "plese provided the delete feild " })

        // }


        // if (!query.isPublished || query.isPublished == "undefined") {
        //     return res.status(200).send({ status: true, msg: "plese provided the published  feild" })
        // }
        // if (!query.authorId || query.authorId == "undefined") {
        //     return res.status(200).send({ status: true, msg: "plese provided the author id   feild" })
        // }
        // const blogs = await blogModel.find({ $and: [query, { isDeleted: false }, { isPublished: true }] })

        // if (blogs.length == 0) {
        //     return res.status(404).send({ status: false, msg: "allready deleted" })
        // }
        // return res.status(200).send({ status: true, data: blogs })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}
//=======================================================================================//
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

    //   let blogId = mongoose.Types.ObjectId.isValid(Id)
        // if (!Id==true) return res.send("userId  is not writen")
       // if (Id==null) return res.send("userId  is not writen")
        // if (!validId(Id)) return res.send("blogId invalid")
        
       if(title=== "undifined"){
        return res.status(400).send({msg: "title is undifined"})
       }
       if(body=== "undifined"){
        return res.status(400).send({msg: "body is undifined"})
       }
       if(tags=== "undifined"){
        return res.status(400).send({msg: "tags is undefined"})
       }
       if(subcategory=== "undifined"){
        return res.status(400).send({msg: "subcatagory is undefined"})
       }
       
       //return res.send(blog)
       const findValue = await blogModel.findById(Id)
       if(findValue.isDeleted==true){
        return res.status(404).send({msg: "blog is already deleted"})
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
        res.status(200).send(blog)
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
//=======================================================================================//

const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId
        if (!id) {
            return res.status(400).send({ msg: "id is mandatory" })
        }
        let checkId = await blogModel.findById(id)
        if (!checkId) {
            return res.status(404).send({ msg: "id is incorrect" })
        }
        if (checkId.isDeleted == true) {
           return  res.status(404).send({ status: false, msg: "blog is already deleted" })
        }
        let checkDelete = await blogModel.updateMany({ _id: id }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        return res.status(200).send({ status: true ,data:checkDelete})
    } catch(error){
          return res.status(500).send({ status: false, msg: error.message })
    }
}

//=======================================================================================//

 const deleteBlogByQuery = async function (req, res) {
    try {
        let data = req.query
        if (!Object.keys(data).length) {
            return res.status(400).send({ status: false, msg: "please select key for deleting the blog" })
        }
        
        if (Object.keys(data).some(a=>a=="authorId")) {
            if (!data.authorId) {
                return res.status(404).send({ status: false, msg: "Author id must be present" })
               
            }

            if (!mongoose.isValidObjectId(data.authorId)) {
                return res.status(400).send({ status: false, msg: "plese enter the correct length of author id" })
                
            }
        }
            
            let deletedBlog= await blogModel.find(data)

            console.log(deletedBlog);
            //if(deletedBlog.length==0)return res.send("not found")
            if(deletedBlog[0].isDeleted === true){
                
                    return res.status(404).send({ status: false, msg: "blog is already deleted" })
            }
           //return res.send(deletedBlog)
            let blogs = await blogModel.find(data).updateMany( {isDeleted: true, deleteAt: Date.now()})
          
                return res.status(200).send({ status: true, msg: `Total deleted document count:${blogs.modifiedCount}`, data: blogs })
            
         
    }catch (err) {
            console.log(err)
          return   res.status(500).send({ status: false, msg: err.message })
        }}




module.exports.createBlog = createBlog

module.exports.getBlog = getBlog

module.exports.updateBlog = updateBlog

module.exports.deleteBlog = deleteBlog

module.exports.deleteBlogByQuery = deleteBlogByQuery