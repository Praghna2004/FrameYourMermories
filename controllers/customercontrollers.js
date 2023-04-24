const db = require("../db");
const jwt=require('jsonwebtoken');
const {ObjectId}=require('mongodb');

const cookieparser=require('cookie-parser');

const maxAge=30*24*60*60;//3 days 

const createtoken=(id)=>{
    
    return jwt.sign({id},'a secret message',{expiresIn:maxAge});
}

const getcustomerId=async (req)=>{
    let deocded=undefined;
    const token=req.cookies.jwt1;
    await jwt.verify(token,'a secret message',(error,decode)=>{
        if(error){
            deocded=undefined;
        }else{
            
            deocded=decode;
        }
    })
    
    return deocded.id;
}

module.exports={
    customersignuplogin_get:(req,res)=>{
        res.render('customersignuplogin',{wrongPassword:'',alreadyexists:''});
    },

    customerlogindetails_post:async(req,res)=>{
        const dbobj=db.getDb();
    
        dbobj.collection('details').findOne({email:req.body.myMail})
        .then(async result=>{
            if(result){
                if(result.password == req.body.myPassword){

                    const token=createtoken(result._id);
    
                    res.cookie('jwt1',token,{httpOnly:true,maxAge:maxAge*1000});

                    res.render('customerinterface1');
                }
                else{
                    res.render('customersignuplogin',{wrongPassword:'Incorrect Credentials',alreadyexists:''}) 
                }
                
            }
            else{
                res.render('customersignuplogin',{wrongPassword:'Incorrect Credentials',alreadyexists:''})
            }
        })
    },

    customersignupdetails_post:async(req,res)=>{
        console.log('sfsf',req.body);
        const dbobj=db.getDb();
        try{
             await dbobj.collection('details').findOne({email:req.body.myMail}).then(async (result)=>{
                if(result){
                    res.render('customersignuplogin',{wrongPassword:'',alreadyexists:'Account already exists'})
                }
                else{
                     await dbobj.collection('details').insertOne({name:req.body.myName,email:req.body.myMail,password:req.body.myPassword})
                     .then(result1=>{
                        if(result1){

                            const token=createtoken(result1._id);

                    res.cookie('jwt1',token,{httpOnly:true,maxAge:maxAge*1000});

                            res.render('customersignuplogin',{wrongPassword:'',alreadyexists:''});
                        }
                        else{
                            res.send('Some Error Occured While inserting Details of user');
                        }
    
                        })
                }
            })   
            }
        catch(error){
            console.log(error.message,'sgsgg');
            res.send(`Some Error Occured : ${error}`);
        }
    },

    customerinterface1_get:async (req,res)=>{
        const cid=await getcustomerId(req);
        console.log(cid,'jhvgh');
        res.render('customerinterface1');
    },

    customerinterface2_get:(req,res)=>{
        const dbobj=db.getDb();
        let products=[]
        dbobj.collection('Product').find()
        .forEach(product=>{
            products.push(product);
        })
        .then(()=>{
            res.render('customerinterface2',{products,sucess:''});
        })
        .catch((err)=>{
            res.send(`Some Error Occured While Fetching The Products : ${err}`);
        })
    },

    customerproductaddtocart_id_get:async (req,res)=>{
        const product_id=req.params.id;
        const dbobj=db.getDb();
        
        const userid=await getcustomerId(req);
        if(ObjectId.isValid(product_id)){
            dbobj.collection('details').updateOne({_id:new ObjectId(userid)},{ $push: { orders: product_id } })
            .then(product=>{
                res.redirect('/customerentirecart');
            }).catch(eror=>{
                res.status(500).send('Some Error Occured while Inserting into cart Data');
            });
        }else{
            res.status(500).send('Not a Valid Product');
        }
        
    },
    customerentirecart_get:async (req,res)=>{
        const userid=await getcustomerId(req);

        let productslist=[];

        const dbobj=db.getDb();

        await dbobj.collection('details').findOne({_id:new ObjectId(userid)}).then(result=>{
            if(result){
                
                if(result.orders.length>0){
                    productslist= result.orders.slice();
                    // console.log(productslist,'sdfsf')
                }
                
            }
        }).catch(err=>{
            console.log(`Some Error Occured : ${err}`);
        });

        let updatedlist=[];

        if(productslist.length>0){
            productslist.forEach(product=>{
                updatedlist.push(new ObjectId(product))
            });
            
            let allcartp=[];

            await dbobj.collection('Product').find({_id:{$in:updatedlist}})
            .forEach(sproduct=>{
                allcartp.push(sproduct);
            }).then(()=>{
                // console.log(allcartp);
                res.render('customercart',{products:allcartp});
            }).catch((err)=>{
                res.send(`Some Error Occured While Fetching The cart : ${err}`);
            })

        }else{
            res.send('No Orders Yet');
        }
    },

    edit_profile_get:async (req,res)=>{
        
        const userid=await getcustomerId(req);
        const dbobj=db.getDb();
        await dbobj.collection('details').findOne({_id:new ObjectId(userid)})
        .then((result)=>{
            res.render('edit_profile',{mail:result.email});
        })
        .catch((erre)=>{
            res.send(`Some error Occured while fetching mail : ${erre}`);
        })

        
    },
    
    mypage2_get:async (req,res)=>{
        const userid=await getcustomerId(req);
            const dbobj=db.getDb();
            await dbobj.collection('details').findOne({_id:new ObjectId(userid)})
            .then((result)=>{
                res.render('mypage2',{name:result.name});
            })
            .catch((erre)=>{
                res.send(`Some error Occured while fetching name : ${erre}`);
            })
    },

    change_password_get:(req,res)=>{
        res.render('change_password',{Success:''});
    }
    ,

    mypage2_edit_post:async (req,res)=>{
        console.log(req.body);
        const userid=await getcustomerId(req);
            const dbobj=db.getDb();
            await dbobj.collection('details').updateOne({_id:new ObjectId(userid)},{$set:{name:req.body.name1}})
            .then((result)=>{
                res.redirect('mypage2');
            })
            .catch((erre)=>{
                res.send(`Some error Occured while Updating details : ${erre}`);
            })
    }
    ,
    customerproductaddtowishlist_id_get:async (req,res)=>{
        const product_id=req.params.id;
        const dbobj=db.getDb();
        
        const userid=await getcustomerId(req);
        if(ObjectId.isValid(product_id)){
            dbobj.collection('details').updateOne({_id:new ObjectId(userid)},{ $push: { wishlist: product_id } })
            .then(product=>{
                res.redirect('/customerentirewishlist');
            }).catch(eror=>{
                res.status(500).send('Some Error Occured while Inserting into cart Data');
            });
        }else{
            res.status(500).send('Not a Valid Product');
        }
        
    },

    customerentirewishlist_get:async (req,res)=>{
        const userid=await getcustomerId(req);

        let productslist=[];

        const dbobj=db.getDb();

        await dbobj.collection('details').findOne({_id:new ObjectId(userid)}).then(result=>{
            if(result){
                
                if(result.wishlist.length>0){
                    productslist= result.wishlist.slice();
                    // console.log(productslist,'sdfsf')
                }
                
            }
        }).catch(err=>{
            console.log(`Some Error Occured : ${err}`);
        });

        let updatedlist=[];

        if(productslist.length>0){
            productslist.forEach(product=>{
                updatedlist.push(new ObjectId(product))
            });
            
            let allcartp=[];

            await dbobj.collection('Product').find({_id:{$in:updatedlist}})
            .forEach(sproduct=>{
                allcartp.push(sproduct);
            }).then(()=>{
                // console.log(allcartp);
                res.render('customerwishlist',{products:allcartp})
            }).catch((err)=>{
                res.send(`Some Error Occured While Fetching The wishList : ${err}`);
            })

        }else{
            res.send('No Orders Yet');
        }
    }
    


}