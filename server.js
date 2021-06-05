const express =require('express');
const token =require('jsonwebtoken');
require('dotenv').config();
const app=express();
app.use(express.json());


let refreshtokens=[]

const posts =[
    {
        "username":"mani",
        "title":"post1"
    },
    {
        "username":"hari",
        "title":"post2"
    },{
        "username":"venkat",
        "title":"post3"
    }
]

app.get('/posts',authentication,(req,res)=>{
    res.json(posts.filter(post => post.username === req.user.name));

});


app.post('/token',(req,res)=>{
    const username = req.body.name;
    const user = {name : username};
    const accesstoken = generateAccessToken(user);
    const refreshtoken = token.sign(user,process.env.REFRESH_TOKEN) 
    //we don't need to provide the expires it automatically take care by jwt
    refreshtokens.push(refreshtoken);  
    res.json({accesstoken :accesstoken,refreshtoken :refreshtoken});

});

app.post('/refresh',(req,res)=>{
    let reftoken =req.body.reftoken;
    if (reftoken === null) return res.send("no token");
    //console.log(refreshtokens.includes(reftoken));
    if (!refreshtokens.includes(reftoken)) return res.send("no token in the refresh")
    token.verify(reftoken,process.env.REFRESH_TOKEN,(err,user)=>{
        if (err) return res.status(403);
        const accesstoken=generateAccessToken({name:user.name});
        res.json({accesstoken:accesstoken});

    });   

});


function authentication(req,res,next){
    const authheaders=req.headers['authorization'];
    const authtoken =authheaders.split(' ')[1];
    token.verify(authtoken,process.env.ACCESS_TOKEN,(err,user)=>{
        if (err) return res.send("auth failed")
        req.user=user;
        next();
    });
}


function generateAccessToken(user){
    const jwt=token.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'30s'});
    return jwt;


}
app.listen(3000);