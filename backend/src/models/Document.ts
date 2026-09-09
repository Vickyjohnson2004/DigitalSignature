import { Schema, model, Types } from 'mongoose';
const schema=new Schema({userId:{type:Types.ObjectId,ref:'User',required:true,index:true},fileName:{type:String,required:true},fileType:{type:String,required:true},fileSize:{type:Number,required:true},fileHash:{type:String,required:true,index:true},data:{type:Buffer,required:true}},{timestamps:true});
schema.index({userId:1,createdAt:-1}); export const DocumentModel=model('Document',schema);
