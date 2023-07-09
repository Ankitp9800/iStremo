const express = require("express");
const cors = require("cors");
const bp = require("body-parser")
const app= express();
const path = require('path');
const PORT = 8080;

require("./db/connection");
app.use(cors("*"));
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));;
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use("/v1", require("./routes/router.js"));

app.get("/",(req,res)=>{
    res.send({message:"Service running fine"});
})

app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
});     
