'use strict';

var User = require('../models/user');

var fs = require('fs');
// show user page

exports.getProfile = function(req, res, next){
  var form = {},
  error = null,
  formFlash = req.flash('form'),
  errorFlash = req.flash('error');

  if (formFlash.length) {
    form.email = formFlash[0].email;
  }
  if (errorFlash.length) {
    error = errorFlash[0];
  }
  res.render(req.render, {user: req.user, form: form, error: error});
};

// Updates generic profile information

exports.postProfile = function(req, res, next){
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('name', 'Name is required').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.redirect.failure);
  }

  if(req.body.email != req.user.email){
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'An account with that email address already exists.' });
        return res.redirect(req.redirect.failure);
      } else {
        User.findById(req.user.id, function(err, user) {
          if (err) return next(err);
          user.email = req.body.email || '';
          user.profile.name = req.body.name || '';
          user.profile.gender = req.body.gender || '';
          user.profile.location = req.body.location || '';
          user.profile.website = req.body.website || '';

          user.save(function(err) {
            if (err) return next(err);
            user.updateStripeEmail(function(err){
              if (err) return next(err);
              req.flash('success', { msg: 'Profile information updated.' });
              res.redirect(req.redirect.success);
            });
          });
        });
      }
    });
  } else {
    User.findById(req.user.id, function(err, user) {
      if (err) return next(err);
      user.profile.name = req.body.name || '';
      user.profile.gender = req.body.gender || '';
      user.profile.location = req.body.location || '';
      user.profile.website = req.body.website || '';

      user.save(function(err) {
        if (err) return next(err);
        user.updateStripeEmail(function(err){
          if (err) return next(err);
          req.flash('success', { msg: 'Profile information updated.' });
          res.redirect(req.redirect.success);
        });
      });
    });
  }
};

// Removes account
exports.testAppCode = function(req, res, next){
console.log(req.body);

  User.findById(req.user.id, function(err, user) {

if(true){
var array = fs.readFileSync('appsumo.txt').toString().split("\n");
if(array.includes(req.body.code + "\r") || array.includes(req.body.code)){
var index = array.indexOf(req.body.code); // 1
console.log(index);
if (index > -1) {
  array.splice(index, 1);
fs.writeFileSync('appsumo.txt', array.join("\n"),{encoding:'utf8',flag:'w'});

}

user.referral += req.body.code + ",";
user.codes += req.body.code + ",";

user.stripe.plan = "lifetime";

user.save(function(err) {
        if (err) return next(err);
req.flash('success', 'Appsumo offer claimed.')
              res.send(user.stripe.plan);

});


}
}

});

};


exports.deleteAccount = function(req, res, next){
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.remove(function (err, user) {
      if (err) return next(err);
      user.cancelStripe(function(err){
        if (err) return next(err);

        req.logout();
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect(req.redirect.success);
      });
    });
  });
};
exports.checkPlan = function(req, res, next){
  User.findById(req.user.id, function(err, user) {
        res.send(user);
  });
};

// Adds or updates a users card.

exports.postBilling = function(req, res, next){
  var stripeToken = req.body.stripeToken;

  if(!stripeToken){
    req.flash('errors', { msg: 'Please provide a valid card.' });
    return res.redirect(req.redirect.failure);
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.setCard(stripeToken, function (err) {
      if (err) {
        if(err.code && err.code == 'card_declined'){
          req.flash('errors', { msg: 'Your card was declined. Please provide a valid card.' });
          return res.redirect(req.redirect.failure);
        }
        req.flash('errors', { msg: 'An unexpected error occurred.' });
        return res.redirect(req.redirect.failure);
      }
      req.flash('success', { msg: 'Billing has been updated.' });
      res.redirect(req.redirect.success);
    });
  });
};

exports.postPlan = function(req, res, next){
  var plan = req.body.plan;
  var stripeToken = null;

  if(plan){
    plan = plan.toLowerCase();
  }

  if(req.user.stripe.plan == plan){
    req.flash('info', {msg: 'The selected plan is the same as the current plan.'});
    return res.redirect(req.redirect.success);
  }

  if(req.body.stripeToken){
    stripeToken = req.body.stripeToken;
  }

  if(!req.user.stripe.last4 && !req.body.stripeToken){
    req.flash('errors', {msg: 'Please add a card to your account before choosing a plan.'});
    return res.redirect(req.redirect.failure);
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.setPlan(plan, stripeToken, function (err) {
      var msg;

      if (err) {
        if(err.code && err.code == 'card_declined'){
          msg = 'Your card was declined. Please provide a valid card.';
        } else if(err && err.message) {
          msg = err.message;
        } else {
          msg = 'An unexpected error occurred.';
        }

        req.flash('errors', { msg:  msg});
        return res.redirect(req.redirect.failure);
      }
      req.flash('success', { msg: 'Plan has been updated.' });
      res.redirect(req.redirect.success);
    });
  });
};
