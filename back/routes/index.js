const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const homePageWithNotification = require('../helpers/homePageWithNotification');
const notifications = require('../constants/notification-types');
const addMiddlewares = require('../middlewares/add-middlewares');
const { getUserNickname } = require('../helpers/reqHelpers');
const { bcrypt: saltRounds } = require('../constants/other-constants');

const router = express.Router();
addMiddlewares(router);

// GET login form
router.get('/login', (req, res) => {
  console.log('Login GET');
  res.render('login');
});

// POST login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      console.log('Login POST  auth ER 1');
      return res.render('login', { [notifications.error]: err });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.log('Login POST LOGIN ER 1');
        return res.render('login', { [notifications.error]: err });
      }
      console.log('Login POST LOGIN True');
      return res.redirect(
        homePageWithNotification(notifications.message, 'You Logged In!'),
      );
    });
  })(req, res, next);
});

router.post('/log', async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res.json({ message: err });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.json({ message: err });
      }
      return res.json({ user: user.nickname });
    });
  })(req, res, next);
});

// GET registration form
router.get('/sign-up', (req, res) => {
  res.render('sign-up');
});

router.get('/authcheck', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user.nickname });
  } else {
    res.json({ message: 'You are not authinticated,please log-in or register' });
  }
});
// POST new user
router.post('/sign-up', async (req, res) => {
  const { nickname, email, password } = req.body;
  const curEmail = await User.getByEmail(email);
  if (curEmail.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      nickname,
      email,
      password: hash,
      points: 0,
    });
    return res.redirect(
      homePageWithNotification(
        notifications.message,
        'You Signed Up. Please Log In!',
      ),
    );
  }
  return res.render('sign-up', {
    [notifications.error]: 'This email is already used',
  });
});

router.post('/reg', async (req, res, next) => {
  const { nickname, email, password } = req.body;
  const curUser = await User.find({ email: req.body.email });
  if (curUser.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      nickname,
      email,
      password: hash,
      points: 0,
    });
    return passport.authenticate('local', async (err, user) => {
      const thisUser = await User.findOne({ email: req.body.email });
      if (err) {
        return res.json({ message: err });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.json({ message: err });
        }
        return res.json({ user: thisUser.nickname });
      });
    })(req, res, next);
  }
  return res.json({ message: 'This email is already used' });
});

// GET user log out
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(
    homePageWithNotification(notifications.message, 'You logged out!'),
  );
});
router.get('/logoout', (req, res) => {
  req.logout();
  console.log('LOGOUT get');
  res.json({ user: '' });
});
// GET home page
router.get('/', async (req, res) => {
  const { error, message } = req.query;
  console.log('GET HOME PAGE');
  res.render('index', {
    title: 'Home',
    currentUser: getUserNickname(req),
    error,
    message,
  });
});
// GET Page with Authentication
router.get('/auth-page', async (req, res) => {
  if (req.isAuthenticated()) {
    console.log('Esli AUTH-PAGE TRUE');
    console.log('THis user data = ', req.user);

    res.render('auth-page', { currentUser: getUserNickname(req) });
  } else {
    console.log('Esli AUTH-PAGE NOT NOT TRUE!');
    res.redirect(
      homePageWithNotification(notifications.error, 'Not Authenticated!'),
    );
  }
});

module.exports = router;