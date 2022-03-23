const { Router } = require('express');
const router = new Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const isLoggedOut = require('../middleware/isLoggedOut')
const isLoggedIn = require('../middleware/isLoggedIn')
const mongoose = require('mongoose')


// GET route ==> to display the signup form to users

const salt = 10

router.get("/signup", isLoggedOut,(req, res) => {
    res.render('auth/signup');
  });
// POST route ==> to process form data
router.post("/signup", isLoggedOut, (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)

  bcrypt
  .genSalt(salt)
  .then(salt => bcrypt.hash(password, salt))
  .then(hashedPassword => {
    return User.create({
      username,
      password: hashedPassword
    })
  })
  .then((user) => {
    req.session.username = user 
    res.redirect('/profile')
  })
  .catch(error => {
    console.log(error)
    res.redirect('/error.hbs') 
  })
});

router.get("/login", isLoggedOut, (req, res, next)=> {
  res.render("auth/login", {user: req.session.username});
});

router.post("/login", isLoggedOut, async (req, res, next)=> {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.render("auth/login", {message: "Completion of all fields required"});
            return;
        }
        let dbUser = await User.findOne({ username });
        if (!dbUser) {
            const newDbUser = await User.create({username, passwordHash: passwordHash});
            res.render("auth/login", {message: "User unknown. Please check your details or sign up."});
        } else if (await bcrypt.compare(password, dbUser.passwordHash)) {
            req.session.username = dbUser;
            res.redirect("/profile");
        } else {
                res.render("auth/login", {message: "Password incorrect, please try again or sign up if you have not registered"});
        }
    } catch (error) {
        console.log(error);
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(500).render('auth/login', { message: error.message});
        } else {
            next(error);
        }
    }
});
router.get("/profile", isLoggedIn, (req, res)=> {
  res.render("profile.hbs", {user : req.session.username});
});


router.get('/logout', isLoggedIn, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500)
      }
      res.redirect('/')
    })
  })


module.exports = router;






