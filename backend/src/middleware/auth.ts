import { Request,Response,NextFunction } from 'express'; import jwt from 'jsonwebtoken'; import { env } from '../config/env';
export type AuthRequest=Request & {user?:{id:string;role:string}};
export function auth(req:AuthRequest,res:Response,next:NextFunction){const token=req.headers.authorization?.replace('Bearer ',''); if(!token)return res.status(401).json({message:'Authentication required'}); try{req.user=jwt.verify(token,env.JWT_SECRET) as {id:string;role:string}; next();}catch{return res.status(401).json({message:'Invalid or expired token'});}}
export function admin(req:AuthRequest,res:Response,next:NextFunction){if(req.user?.role!=='admin')return res.status(403).json({message:'Administrator access required'});next();}
