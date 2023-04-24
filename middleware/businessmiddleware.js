const jwt=require('jsonwebtoken');
const db = require('../db');
const {ObjectId}=require('mongodb');

const requireBusinessAuth=async (req,res,next)=>{
    const token=req.cookies.jwt;
    
    if(token){
        jwt.verify(token,'a secret message',async (error,decodedtoken)=>{
            if(error){
                console.log(error.message);
                res.redirect('/businesssignuplogin');
            }else{
                const dbobj=db.getDb();
                await dbobj.collection('business').findOne({_id:new ObjectId(decodedtoken.id)})
                .then(result=>{
                    if(result){
                        // console.log('as',result);
                        if(result.isverified==true){
                            next();
                        }else{
                            res.redirect('/businesssignuplogin');
                        }
                    }
                })
                .catch(()=>{
                    res.redirect('/businesssignuplogin');
                })
            }

        })
            
        
    }else{
        res.redirect('/businesssignuplogin');
    }
}

const checkUser=(req,res,next)=>{
    const token=req.cookies.jwt;
    if(token){
        jwt.verify(token,'a secret message',(error,decodedtoken)=>{
            if(error){
                console.log(error.message);
                res.locals.user='';
                next();
            }else{
                
                const dbid= db.getDb();

                dbid.collection('business').findOne({_id: new ObjectId(decodedtoken.id)})
                .then(reslut=>{
                    if(reslut){
                        res.locals.user=reslut.username;
                    next();
                    }
                    else{
                        res.locals.user='';
                        next();
                    }
                    
                })
            }

        })
    }else{
        res.locals.user='';
        next();
    }
}

module.exports={requireBusinessAuth,checkUser};