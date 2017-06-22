var Tip = require('./models/tip');
var User = require('./models/user');

function getTips(res) {
    Tip.find(function (err, tips) {
        
        console.log(tips);
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        res.json(tips); // return all todos in JSON format
    });
}

function getUsers(res) {
    User.find(function (err, users) {
        
        console.log(users);
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        res.json(users); // return all todos in JSON format
    });
}


module.exports = function (app) {
    
    ///////////
    // tipS //
    ///////////
    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/tips', function (req, res) {
        // use mongoose to get all todos in the database
        getTips(res);
    });

    app.get('/api/tips/:tip_id', function (req, res) {
        // use mongoose to get all todos in the database
        Tip.findById(req.params.tip_id, function (err, user) { 
            res.send(user);
        } );
    });
  
    // find by name
    app.get('/api/tips/name/:tip_name', function (req, res) {
        // use mongoose to get all todos in the database
        Tip.findOne({slug:req.params.tip_name}, {name: 1}, function (err, tip) { 
            res.send(tip);
        } );
    });
  
    // create todo and send back all todos after creation
    app.post('/api/tips', function (req, res) {
        console.log("TIPSING");
        console.log(req.body);

        // create a todo, information comes from AJAX request from Angular
        var newtip = new Tip({
            display: true,
            author_id: req.body.author_id,
            author: req.body.author,
            name: req.body.name,
            category: req.body.category,
            continent: req.body.continent,
            country: req.body.country,
            city: req.body.city,
            address: req.body.address,
            lat: req.body.lat,
            lon: req.body.lon,
            text: req.body.text,
            cover: req.body.cover
        });

        newtip.save(function(err) {
            if (err !== null) {
                res.status(500).json({ error: "save failed", err: err});
                return;
            } else {
                res.status(201).json(newtip);
            }
        });
    });
  
    app.get('/api/tips/field/author/:id', function (req, res) {
        // use mongoose to get all tips in the database
        Tip.find({ 'author_id': req.params.id }, function (err, place) { 
            res.send(place);
        } );
    });

    app.put('/api/tips/:tip_id', function (req, res) {
        console.log(req.body.name);
        Tip.findOneAndUpdate({_id:req.params.tip_id}, req.body, function (err, tip) {
          res.send(tip);
        });
    });

    // delete a todo
    app.delete('/api/tips/:tip_id', function (req, res) {
        Tip.remove({
            _id: req.params.tip_id
        }, function (err, tip) {
            if (err)
                res.send(err);
        });
    });
  
    ///////////
    // USERS //
    ///////////
    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/users', function (req, res) {
        // use mongoose to get all todos in the database
        getUsers(res);
    });

    app.get('/api/users/:user_id', function (req, res) {
        // use mongoose to get all todos in the database
        Tip.findById(req.params.user_id, function (err, user) { 
            res.send(user);
        } );
    });
  
    // find by name
    app.get('/api/users/name/:user_name', function (req, res) {
        // use mongoose to get all todos in the database
        Tip.findOne({slug:req.params.user_name}, {name: 1}, function (err, user) { 
            res.send(user);
        } );
    });
  
    // create todo and send back all todos after creation
    app.post('/api/users', function (req, res) {
        console.log("CREATING USER");
        console.log(req.body);

        // create a todo, information comes from AJAX request from Angular
        var newuser = new User({
            fcb_id: req.body.fcb_id,
            name: req.body.name,
            email: req.body.email,
            mdp: req.body.mdp,
            cover: req.body.cover,
            avatar: req.body.avatar,
            friends: req.body.friends,
            pending_friend_request: req.body.pending_friend_request,
            tips: req.body.tips
        });

        newuser.save(function(err) {
            if (err !== null) {
                res.status(500).json({ error: "save failed", err: err});
                return;
            } else {
                res.status(201).json(newuser);
            }
        });
    });
  
    app.get('/api/users/field/fcb_id/:id', function (req, res) {
        // use mongoose to get all tips in the database
        Tip.find({ 'fcb_id': req.params.id }, function (err, place) { 
            res.send(place);
        } );
    });

    app.put('/api/users/:user_id', function (req, res) {
        console.log(req.body.name);
        Tip.findOneAndUpdate({_id:req.params.user_id}, req.body, function (err, tip) {
          res.send(tip);
        });
    });

    // delete a todo
    app.delete('/api/users/:user_id', function (req, res) {
        Tip.remove({
            _id: req.params.user_id
        }, function (err, tip) {
            if (err)
                res.send(err);
        });
    });
  
    
};