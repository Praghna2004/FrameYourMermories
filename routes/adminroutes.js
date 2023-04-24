const express=require('express');
const db = require('../db');
const router=express.Router();

const getallcomplaints=async ()=>{
    const dbobj=db.getDb();
    let allcomplaints=[];
    await dbobj.collection('complaints').find()
    .forEach(complaint=>{
        allcomplaints.push(complaint);
    })
    .then(()=>{
        
    })
    .catch(()=>{
        console.log(`Some Error Occured while Fetching Complaints `);
    })
    return allcomplaints;
}

const getpartnerdetails=async ()=>{
    const dbobj=db.getDb();
    let partners=[];
    await dbobj.collection('business').find()
    .forEach(partner=>{
        partners.push(partner);
    })
    .then(()=>{
        
    })
    .catch(()=>{
        console.log(`Some Error Occured while Fetching Complaints `);
    })
    return partners;
}

const getproud=async ()=>{
    const dbobj=db.getDb();
    let products=[];
    await dbobj.collection('Product').find()
    .forEach(prod=>{
        products.push(prod);
    })
    .then(()=>{
        
    })
    .catch(()=>{
        console.log(`Some Error Occured while Fetching Complaints `);
    })
    return products;
}

const getclients=async ()=>{
    const dbobj=db.getDb();
    let clients=[];
    await dbobj.collection('customerlogindetails').find()
    .forEach(client=>{
        clients.push(client);
    })
    .then(()=>{
        
    })
    .catch(()=>{
        console.log(`Some Error Occured while Fetching Complaints `);
    })
    return clients;
}




router.get('/adminlogin',(req,res)=>{
    res.render('adminlogin',{wrongPassword:''});
})

router.post('/adminlogindetails',(req,res)=>{
    
    const dbobj=db.getDb();

    dbobj.collection('adminlogin').findOne({email:req.body.myemail,adminid:req.body.myid,password:req.body.mypassword})
    .then(result=>{
        if(result){
            res.redirect('/Admindashboard');
        }else{
            res.render('adminlogin',{wrongPassword:'Incorrect Credentials'})
        }
    })

})

router.get('/Admindashboard',async (req,res)=>{

    const complaints=await getallcomplaints();
    const partners=await getpartnerdetails();
    const products=await getproud();
    const clients = await getclients();

    let partnum=5;
    let noofprod=500;
    let sales=30;
    let partdetails=[
        {name:"dean",product:"destwedding",category:"event",Availability:"avaliable"},
        {name:"sam",product:"destwedding",category:"event",Availability:"avaliable"},
        {name:"jack",product:"destwedding",category:"event",Availability:"avaliable"}
    ];
    let clientnum=300;
    let noofrev = 500;
    let revenue = 10000000;
    let clientdetails=[
        {name:"dean",email:"varaprasad.r21@iiits.in",Bookings:2},
        {name:"sam",email:"varaprasad.r21@iiits.in",Bookings:0},
        {name:"jack",email:"varaprasad.r21@iiits.in",Bookings:1}
    ];
    res.render('Admindashboard',{partnum,noofprod,sales,partdetails,clientnum,noofrev,revenue,clientdetails,complaints,partners,products,clients});
});

module.exports=router;