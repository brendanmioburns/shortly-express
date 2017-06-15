const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
(req, res) => {
  console.log('GET REQUEST RECEIVED AT /');
  res.render('index');
});

app.get('/create',
(req, res) => {
  console.log('GET REQUEST RECEIVED AT /CREATE');
  res.render('index');
});

app.get('/links',
(req, res, next) => {
  console.log('GET REQUEST RECEIVED AT GET /LINKS');
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
      console.log('LINKS RECEIVED FROM DATABASE = ', links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  console.log('POST REQUEST RECEIVED AT /LINKS');

  var url = req.body.url;
  console.log('REQ.BODY.URL = ', req.body.url);
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// WHEN USER ASKS FOR SOMETHING:
  // USE THE CODE AT [SUCH-AND-SUCH] SPECIFIC LOCATION IN THESE FILES

app.post('/signup',
  (req, res, next) => {
    console.log('GET REQUEST RECEIVED AT /SIGNUP');
    console.log('REQ = ', req);
    var newUser = {
      id: req.body.id,
      password: req.body.password,
      // salt: TBD
      username: req.body.username
    };
    console.log('NEWUSER = ', newUser);
  // INVOKE A MODEL METHOD TO WRITE THESE DATA TO THE DATABASE
    Users.create(newUser.username, newUser.password);


  });



// app.post('/signup', function (req, res, next) {
//     var user = {
//        Name: req.body.name,
//        Email: req.body.email,
//        Pass: req.body.pass,
//        Num: req.body.num
//    };
//    var UserReg = mongoose.model('UserReg', RegSchema);
//    UserReg.create(user, function(err, newUser) {
//       if(err) return next(err);
//       req.session.user = email;
//       return res.send('Logged In!');
//    });
// });


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
