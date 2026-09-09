import {Router} from 'express'; import {algorithms} from '../utils/crypto'; const r=Router(); r.get('/',(_req,res)=>res.json({algorithms:Object.values(algorithms)})); export default r;
