var express = require('express');
var router = express.Router();
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');
var fs = require("fs");

var jsonFile = fs.readFileSync('passwd.json', 'utf8');
var creds = JSON.parse(jsonFile);

// Route all into Auth.html
router.all('/interface.html', function (req, res) {
  res.send('Hello in index.html');
  //res.redirect('Auth.html');
})

router.post('/login',async function(req,res){
	if(!req.body) return res.sendStatus(400);
	var user=req.body.username;
	var pwd=req.body.password;
  
  if (creds.users.includes(user)) {
    var index = creds.users.indexOf(user);
    try {
      if (await argon2i.verify(creds.passwords[index],pwd)) {
        res.redirect("interface.html");
      } else {
        res.sendStatus(400);
      }
    } catch (err) {
      console.log("ERROR while verifying hash password : "+err);
    }
    console.log("User name = "+user+", password is "+pwd);
  }
  else {return res.sendStatus(400)}
  
});

module.exports = router;
