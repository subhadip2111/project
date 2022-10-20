
const mongoose=require("mongoose") 
const isValidRequestBody = function(value){
    return Object.keys(value).length>0
}

const profileM=(value)=>{
 if( value === null ){
  return false
 }

}


   const ValidName=(name)=>{
    return /^[a-zA-Z. ]{3,20}$/.test(name)
   }


const ValidEmail=(name)=>{
    return (/^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/).test(name)
}
   
const ValidPhone=(name)=>{
    return  (/^[6-9][0-9]{9}$/).test(name)
}


const isValidString = (String) => {
    if (/\d/.test(String)) {
      return false
    } else {
      return true
    }
  }
  const isValidBody = (object) => {
    if (Object.keys(object).length > 0) {
      return true
    } else {
      return false;
    }
  };

  const value = (value) => {
    if(typeof value === "string" && value.trim().length===0) return false
      return true
    
  }
const isValid = (value) => {
    if ( value === undefined || value === null ) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}
const isValidNum = (Num) => {
  let correctNum = [0,1]
  return (correctNum.includes(Num))
}

const isValid1 = (value) => {
  if (typeof value == 'undefined' || value == null) return false
  if (typeof value == 'string' && value.trim().length == 0) return false
  if (typeof value == Number && value.toString().trim().length == 0) return false
  return true
}

const isValidPrice = function (price) {
  if (/^\d+(?:\.\d{1,4})?$/.test(price)) {
    return true
  } else {
    return false
  }
}

const validBoolean=(value)=>{
  return value === Boolean
}

const isValidSize = (Size) => {
  let correctSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
  return (correctSize.includes(Size))
}

const  validFormat=(value)=>{
  return value.toUpperCase()
}

    



const validSize5=function(arrayOfSize){
  // arrayOfSize =JSON.parse(arrayOfSize)
   const standardSizes=["S", "XS", "M", "X", "L", "XXL", "XL"]
   for(let i=0;i<arrayOfSize.length;i++){
   if(!standardSizes.includes(arrayOfSize[i]))  return false
   }
   return true
}


const isValid2 = (value) => {
  if (typeof value !== undefined || value  !== null) return false
}
// const validPincode=(value)=>{
// return (/^[1-9]\d{6}$/).test(value)
// }

const validPincode = function (price) {
  if (/^[1-9][0-9]{5}$/.test(price)) {
    return true
  } else {
    return false
  }
}
const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
  };
  const isValidStatus = function(status) {
    return ['pending', 'completed', 'cancelled'].indexOf(status) !== -1
}
  //     const validipic= (url)=> {
  //   return (/[^\\s]+(\\.(?i)(jpe?g|png|gif|bmp))$/).test(url)
  // }

  const validipic = function(profileImage){
    
    const reg = /image\/png|image\/jpeg|image\/jpg/;
    return reg.test(profileImage)

  }

  const validQuantity = function isInteger(value) {
    if (value < 1) return false
    if (isNaN(Number(value))) return false
    if (value % 1 == 0) return true
}
  

//   const isValidPassword = (value)=>{
//     return (/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%&])[a-zA-Z0-9@#$%&]{8,15}$/)
// }
const isValidPassword = (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)

module.exports= {isValidRequestBody,validQuantity,isValidStatus,isValidNum,profileM,validSize5,validBoolean,isValid2,validFormat,validipic,isValidSize,isValidPrice,isValid1,validPincode,value,isValidBody,isValidString,ValidPhone,isValidPassword, ValidEmail, ValidName,isValid,isValidObjectId}