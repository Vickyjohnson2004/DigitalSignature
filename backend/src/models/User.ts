import { Schema, model } from 'mongoose';
const schema=new Schema({fullName:{type:String,required:true,trim:true,maxlength:100},email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true},role:{type:String,enum:['user','admin'],default:'user'},lastLogin:Date},{timestamps:true});
export const User=model('User',schema);
