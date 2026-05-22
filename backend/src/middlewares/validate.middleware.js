import ApiError from "../utils/ApiError.js";

const validate=(schema)=>async(req,res,next)=>{
    try{
        req.body=await schema.parseAsync(req.body);
        next();
    }catch(error){
        next(new ApiError(400, "Validation failed", error.issues || error.errors));
    }
};

export default validate;
