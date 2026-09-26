require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
app.use(helmet());
app.use(express.json());
const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 5 });
const tipLimiter = rateLimit({ windowMs: 60*1000, max: 5 });
function auth(req,res,next){
 const t=req.headers.authorization?.split(' ')[1];
 if(!t) return res.status(401).json({error:"Login needed"});
 try{ req.user=jwt.verify(t,process.env.JWT_SECRET); next(); }
 catch{ return res.status(401).json({error:"Invalid"}); }
}
app.post('/api/login',loginLimiter,(req,res)=>{
 const {phone}=req.body;
 if(!phone) return res.status(400).json({error:"Phone required"});
 const userId=`ug_${phone.slice(-4)}_${Date.now()}`;
 const token=jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:'7d'});
 const isFounder=phone.includes('744344152');
 res.json({token,isFounder,badge:isFounder?"👑 @boom_admin_ug • Founder • 🇺🇬":null});
});
app.post('/api/tip',auth,tipLimiter,(req,res)=>{
 const {toCreatorId,amount}=req.body;
 const ALLOWED=[1000,2000,5000,10000,150000];
 if(!ALLOWED.includes(amount)) return res.status(400).json({error:"Invalid tip"});
 res.json({success:true,message:`Sent ${amount} UGX`,txn:`BOOM_${Date.now()}`});
});
app.get('/',(req,res)=>{ res.send("🔥 BOOM UG is LIVE 🇺🇬"); });
app.listen(process.env.PORT||10000,()=>console.log("BOOM LIVE"));
