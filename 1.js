const express=require('express');
const { ObjectId }=require('mongodb');
const {connectToDb,getDb}=require('./db');
// const { error } = require('console');
const cookieparser=require('cookie-parser');
const {requireBusinessAuth,checkUser}=require('./middleware/businessmiddleware');

const businessroutes=require('./routes/businessroutes');
const customerroutes=require('./routes/customerroutes');
const adminroutes=require('./routes/adminroutes');

const app=express();

let db; 

connectToDb((error)=>{
    if(!error){
        app.listen(3000,()=>{
            console.log('Server listening on port number 3000');
        })
        db=getDb();
    }
})

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieparser());

app.get('/Frameyourmemories',(req,res)=>{
    res.render('final-home');
})

app.get('/aboutus',(req,res)=>{
    res.render('AboutUs');
})

app.use(adminroutes);
app.use(customerroutes);

app.get('*',checkUser);

app.use(businessroutes);

app.get('/set-cookies',(req,res)=>{
    res.cookie('new-user',true,{maxAge:1000*60*60*24,secure:true});
    res.send('SuccessFullyCreated');
})

app.get('/read-cookies',(req,res)=>{
    res.send(req.cookies);
})



app.use((req,res)=>{
    res.send('404 Error Occured');
})