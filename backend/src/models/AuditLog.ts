import { Schema, model, Types } from 'mongoose';
const schema=new Schema({userId:{type:Types.ObjectId,ref:'User'},action:{type:String,required:true,index:true},resourceType:String,resourceId:String,ip:String,details:Schema.Types.Mixed},{timestamps:true}); schema.index({createdAt:-1}); export const AuditLog=model('AuditLog',schema);
