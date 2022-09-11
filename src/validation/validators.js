const mongoose = require('mongoose')

const validValue = function(names){
    if (
        (typeof names == "String" && names.trim().length !== 0) ||
        names.match(/^[A-Za-z]+$/)
      ) return true 
      return false}       

      const valid= function(names){
        if (names != null && names != "undefined") return true
      return false}  

      const validPassword = function (data){
if(data && typeof data === "string" && data.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) return true
return false
      }

      const validId = function(Id){
        if(mongoose.Types.ObjectId.isValid(Id)) return true
        return false
      }
      
      

      function details(x){
        console.log(x);
        
        if (x.length == 0 ) return false
        for (i=0;i<x.length;i++) {
          if (typeof x[i] === "string") return true
        }
        return false
      }

      module.exports={validValue, valid, validPassword, validId, details}

