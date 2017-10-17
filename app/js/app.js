var app = angular.module('gbtipser', [
  'ngRoute',
  'ngFileUpload',
  'ngSanitize',
  'ngCookies',
  'pascalprecht.translate',
  'facebook'
]);

app.config(["$routeProvider", "$locationProvider", "FacebookProvider", function($routeProvider, $locationProvider, FacebookProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
  FacebookProvider.init('792243314276087');
  $routeProvider

  // route for the home page
  .when('/', {
    templateUrl: 'pages/login.html',
    controller: 'loginController'
  })

  .when('/guideline', {
    templateUrl: 'pages/guideline.html',
    controller: 'aboutController'
  })
  
  .when('/bloggers', {
    templateUrl: 'pages/bloggers.html',
    controller: 'bloggersController'
  })

  .when('/user', {
    templateUrl: 'pages/user.html',
    controller: 'userController'
  })

  .when('/edit/user/:id?', {
    templateUrl: 'pages/user-edit.html',
    controller: 'usereditController'
  })
  
  .when('/user/profil/:id?', {
    templateUrl: 'pages/user.html',
    controller: 'userController'
  })
  
  .when('/user/feed', {
    templateUrl: 'pages/newsfeed.html',
    controller: 'feedController'
  })

   .when('/friends-modal', {
    templateUrl: 'pages/friends-modal.html',
    controller: 'userController'
  })

  .when('/login', {
    templateUrl: 'pages/login.html',
    controller: 'aboutController'
  })

  .when('/new', {
    templateUrl: 'pages/new.html',
    controller: 'newController'
  })
  
  .when('/edit/tips/:id?', {
    templateUrl: 'pages/new.html',
    controller: 'newController'
  })

    .when('/new-confirmation', {
    templateUrl: 'pages/new-confirmation.html',
    controller: 'aboutController'
  })

  .when('/tips/:id?', {
    templateUrl: 'pages/tips.html',
    controller: 'tipController'
  })

  // otherwise
  .otherwise({
    redirectTo: '/'
  });
}]);

//TRANSLATION LOCALES
app.config(['$translateProvider', function ($translateProvider) {
  // add translation table
  $translateProvider
    .translations('en', en_locale)
    .translations('fr', fr_locale)
    .preferredLanguage('en');
}]);

app.controller('globalController', function($scope, $location, $http, Facebook, Tips, Users, Shared) {

  $scope.loggedin = false;
  
  $scope.toogle_search = function()
  {
    console.log("search....");
    $scope.search_is_on = !$scope.search_is_on;
  };
  
  $scope.goto = function(type, id){
    $scope.toogle_search();
    if(type == "tips"){
      $location.path('/tips/' + id);
    }
    else{
      $location.path('/user/profil/' + id);
    }
    
  }

  //SEARCH FEATURE
  $scope.searchEntry = "";
  $scope.avSearch = [];
  $scope.refinedSearch = [];
  
  $scope.searchTrigger = function(){
    //trigger data query when input length is 3 letters and more.
    //gets triggered everytime input changes
    if($scope.searchEntry.length > 2 && $scope.searchEntry.length < 7){
      $scope.avSearch = [];
      $scope.refinedSearch = [];
      $scope.blank = {};
      
      //TIP SEARCH
      Tips.search($scope.searchEntry)
        .success(function(data) {
          for(var i = 0; i<data.length; i++){
            if(data[i].display){
              $scope.avSearch.push(data[i]);
              $scope.refinedSearch.push(data[i]);
            }
          }
        });
      
      //USER SEARCH
      for(var a=0; a<$scope.user_f.length; a++){
        if($scope.user_f[a].name.toLowerCase().indexOf($scope.searchEntry.toLowerCase()) !== -1){
          $scope.avSearch.push($scope.user_f[a]);
          $scope.refinedSearch.push($scope.user_f[a]);
        }
      }
      if($scope.refinedSearch.length <= 0){
        $scope.blank = {};
        $scope.blank.name = "aucun résultat";
        $scope.blank.type = "blank";
        $scope.refinedSearch.push($scope.blank);
      }
    }
    else{
      if($scope.avSearch.length > 0){
        $scope.refinedSearch = [];
        $scope.blank ={};
        angular.forEach($scope.avSearch, function(item, key) {
            if(item.name !== undefined){
              if (item.name.match(new RegExp("(" + $scope.searchEntry + ")", "i"))) {
                $scope.refinedSearch.push(item);
              }
            }
            else if(item.email !== undefined){
              if (item.name.match(new RegExp("(" + $scope.searchEntry + ")", "i"))) {
                $scope.refinedSearch.push(item);
              }
              else{
                //nothing
              }
            }
            else{
              //nothing
            }
        });
      }
      console.log("RESULTS");
      console.log($scope.refinedSearch);
      
    }
  }

  //AUTHOR INFO
  var findAuthor = function(){
    angular.forEach($scope.refinedSearch, function(item, value){
      if(item.fcb_id !== undefined){
        var authId = item.fcb_id; 
        Users.getId(authId)
          .success(function(data) {
            $scope.refinedSearch[value].name = data.name;
          });
      }
    });
  }
  
  $scope.me = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.loggedin = true;
        Facebook.api('/me?fields=id,name,email,picture,cover,hometown', function(response) {
          $scope.user = response;
          call_fcb_friends($scope.user.id, false);
        });
      } else {
        $scope.loggedin = false;
        $location.path('/login');
      }
    });
  };
  
  function call_fcb_friends(id, order){
    Facebook.api('/'+id+'/friends?fields=name,id,picture', function(response) {
      $scope.user_friends = response.data;
      $scope.bind_user($scope.user);
    });
  }
  
  //CHECK FOR USER IN DB
  $scope.bind_user = function(user){
    $scope.pending = {}
    $scope.pending.fcb_id = user.id;
    $scope.pending.name = user.name;
    $scope.pending.avatar = user.picture.data.url;
    
    Users.getByFcbId(user.id)
      .success(function(data) {
        if(data.length < 1){
          Users.create($scope.pending)
            .success(function(data){
              console.log(data);
              $scope.friend_classy($scope.user_friends, data);
            });
        }
        else{
           console.log("USER EXIST");
           Shared.setUser(data);
           //USER INFO
           $scope.user_data = data;
           $scope.friend_classy($scope.user_friends, $scope.user_data[0]);
        }
      });
  }
  
  //FRIEND PANEL
  // Ordering friends by status of requests
  $scope.friend_classy = function(friends, user){
    $scope.user_f = [];
    
    for(var i=0;i<friends.length;i++){
      var check_f = $.inArray(friends[i].id, user.friends);
      if(check_f != -1){$scope.user_f.push(friends[i]);}
    }
  }
  
  $scope.me();
  
  
  
});

app.controller('feedController', function($scope, $location, $http, Facebook, Notifs, Shared) {
  
  //USER INFO FOR NOTIF
  //if user not log, back to login
  var db_user = Shared.getUser();
  var is_db_user = isEmpty(db_user);
  if(is_db_user){
    $location.path("/login");
  }
  
  Notifs.getByFcbId(db_user[0].fcb_id)
    .success(function(data){
      console.log(data);
    })
  
});

app.controller('bloggersController', function($scope, $location, $http, Facebook, Users, Notifs, Shared) {
  
  var db_user;
  
  $scope.me = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.loggedin = true;
        Facebook.api('/me?fields=id,name,email,picture,cover,hometown', function(response) {
          $scope.user = response;
          
          //USER INFO FOR NOTIF
          //if user not log, back to login
          db_user = Shared.getUser();
          var is_db_user = isEmpty(db_user);
          if(is_db_user){
            Users.getByFcbId($scope.user.id)
              .success(function(data){
                if(data[0]){
                  Shared.setUser(data);
                  db_user = data;
                  console.log('DBUSER')
                  console.log(db_user);
                  $scope.my_id = db_user[0].fcb_id;
                  $scope.call_public_users();
                }
                else{
                  $location.path('/login');
                }
              })
          }
          else{
            $scope.call_public_users();
            $scope.my_id = db_user[0].fcb_id;
          }
        });
      } else {
        $scope.loggedin = false;
        $location.path('/login');
      }
    });
  };
  
  $scope.me();
  
  $scope.call_public_users = function(){
    $scope.public_users = [];
    Users.get()
      .success(function(data){
        for(var a=0; a<data.length;a++){
          if(data[a].public){
            $scope.public_users.push(data[a]);
          }
        }
      $scope.list_followed();
      console.log(data);
    })
  }
  
  
  //FOLLOWER
  $scope.follow_blog = function(id, followed){
    
    if(followed){
      var is_in = $.inArray(id, db_user[0].friends);
      if(is_in !== -1){
        db_user[0].friends = removeA(db_user[0].friends, id);
        console.log(db_user[0])
        Users.update(db_user[0], db_user[0]._id)
          .success(function(data){
          console.log(data);
          $scope.call_public_users();
        })
      }
    }
    else{
      if(id === db_user[0].fcb_id){
        console.log("you can't follow yourself");
      }
      else{
        var is_in2 = $.inArray(id, db_user[0].friends);
        if(is_in2 === -1){
          db_user[0].friends.push(id);
          Users.update(db_user[0], db_user[0]._id)
            .success(function(data){
            $scope.call_public_users();
          })
        }
      }
    }
  }
  
  $scope.list_followed = function(){
    var followed = db_user[0].friends;
    for(var i=0; i<followed.length;i++){
      for (var y=0; y<$scope.public_users.length;y++){
        if(followed[i] === $scope.public_users[y].fcb_id){
          console.log('match');
          $scope.public_users[y].followed = true;
        }
      }
    }
    console.log('PUBLIC USERS');
    console.log($scope.public_users);
  }
  
});

app.controller('loginController', function($scope, $location, $http, Facebook) {

  $scope.getLoginStatus = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.loggedin = true;
        console.log("connected with fcb");
        console.log(response);
        $location.path('/user');
      } else {
        $scope.loggedin = false;
        console.log("not connected with fcb");
        $location.path('/login');
      }
    });
  };

  $scope.getLoginStatus();

  $scope.login = function() {
    // From now on you can use the Facebook service just as Facebook api says
    Facebook.login(function(response) {
      // Do something with response.
      if(response.status === 'connected') {
        $scope.loggedin = true;
        console.log("connected with fcb");
        console.log(response);
        $location.path('/user');
      }
    }, { scope: 'user_friends' });
  };

});

app.controller('userController', function($scope, $location, $routeParams, $http, Facebook, Shared, Tips, Users, Notifs, Utils) {

  //CAN ACCESS FRIEND PANEL
  $scope.is_on_user = true;
  $scope.loading = true;
  
  //URL DEFAULT BG
  $scope.cover_default = 'app/images/bgdefault.png';
  
  //FACEBOOK LOGIN
  console.log($scope.loggedin);
  
  //CONTINENTS
  $scope.continents = [];
  $http.get('ressources/continent.json').success(function(data) {
    $scope.continents = [];
    $scope.pending_continents = [];
    for(var i=0;i<data.length;i++){
      var is_in = $.inArray(Utils.toSlug(data[i].continent), $scope.pending_continents);
      if(is_in < 0){
        $scope.pending_continents.push(Utils.toSlug(data[i].continent));
        $scope.continents.push(data[i].continent);
      }
    }
    console.log($scope.continents);
  });

  $scope.me = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.loggedin = true;
        Facebook.api('/me?fields=id,name,email,picture,cover,hometown', function(response) {
          $scope.user = response;
          console.log($scope.user);
          call_fcb_friends($scope.user.id, false);
        });
      } else {
        $scope.loggedin = false;
        console.log("not connected with fcb");
        $location.path('/login');
      }
    });
  };
  
  function call_fcb_friends(id, order){
    Facebook.api('/'+id+'/friends?fields=name,id,picture', function(response) {
      $scope.user_friends = response.data;
      console.log(response);
      $scope.bind_user($scope.user);
      if(order && $scope.user_friends !== undefined){$scope.friend_ordering($scope.user_friends, $scope.user_data[0]);}
    });
  }

  //CHECK FOR USER IN DB
  $scope.bind_user = function(user){
    $scope.pending = {}
    $scope.pending.fcb_id = user.id;
    $scope.pending.name = user.name;
    $scope.pending.avatar = user.picture.data.url;
    $scope.pending.public = true;
    
    Users.getByFcbId(user.id)
      .success(function(data) {
        if(data.length < 1){
          Users.create($scope.pending)
            .success(function(data){
              console.log(data);
            });
        }
        else{
           console.log("USER EXIST");
           Shared.setUser(data);
           //USER INFO
           $scope.user_data = data;
           console.log(data);
           $scope.friend_ordering($scope.user_friends, $scope.user_data[0]);
        }
        $scope.display_user();
        $scope.loading = false;
        console.log('LOADED');
      });
  }

  $scope.me();
  
  //ADD TO FAVORITES
  $scope.addtofav = function(id){
    if($scope.user_feed.user_favorites.indexOf(id) !== -1) {
      $scope.user_feed.user_favorites = removeA($scope.user_feed.user_favorites, id);
     
      //update
      Users.update($scope.user_feed, $scope.user_feed._id)
            .success(function(data) {
              console.log("REMOVED FROM FAVORITES");
              console.log($scope.user_feed);
              $scope.user_feed = data;
            });
    }
    else{
      $scope.user_feed.user_favorites.push(id);
      //update
      Users.update($scope.user_feed, $scope.user_feed._id)
            .success(function(data) {
              console.log("ADDED TO FAVORITES");
              $scope.user_feed = data;
              console.log($scope.user_feed);
            });
    }
  }
  
  //URL HASHING
  
  $scope.display_user = function(){
    $scope.url_id = $routeParams.id;
    if($scope.url_id){
      console.log("id in url param"); //debug
      Users.getByFcbId($scope.url_id)
        .success(function(data){
          $scope.user_feed = data[0];
          console.log($scope.user_feed);
          $scope.user_tips($scope.user_feed.fcb_id);
          if($scope.user_feed.fcb_id === $scope.user.fcb_id){
            $scope.own_profile = true;
          }
          else{
            $scope.own_profile = false;
          }
          var check_f = $.inArray($scope.user_feed.fcb_id, $scope.user_data[0].friends);
          if(check_f != -1){$scope.is_friend = true; $scope.is_friend_message = "Followed";}
          else{$scope.is_friend_message = "Follow";}
        })
    }
    else{
      console.log("no id in url param");
      $scope.user_feed = $scope.user_data[0];
          //call favorites
          findFavorites();
      $scope.user_tips($scope.user_feed.fcb_id);
      call_friends_tips();
    }
  }
  
  //FOLLOW / UNFOLLOW
   $scope.follow_profile = function(id, followed){
    
    if(followed){
      var is_in = $.inArray(id, $scope.user_data[0].friends);
      if(is_in !== -1){
        $scope.user_data[0].friends = removeA($scope.user_data[0].friends, id);
        console.log($scope.user_data[0])
        Users.update($scope.user_data[0], $scope.user_data[0]._id)
          .success(function(data){
          $scope.display_user();
        })
      }
    }
    else{
      if(id === $scope.user_data[0].fcb_id){
        console.log("you can't follow yourself");
      }
      else{
        var is_in2 = $.inArray(id, $scope.user_data[0].friends);
        if(is_in2 === -1){
          $scope.user_data[0].friends.push(id);
          Users.update($scope.user_data[0], $scope.user_data[0]._id)
            .success(function(data){
              $scope.display_user();
          })
        }
      }
    }
  }
  
  //FRIEND MODAL
  $scope.friend_modal = false;
  $scope.friending = function(){
    $scope.friend_modal = true;
  }
  
  $scope.close_modals = function(){
    $scope.friend_modal = false;
  }
  
  //MAP
  initMap();
  
  //USER TIPS
  $scope.userTips = [];
  
  //FRIENDS TIPS
  $scope.friendsTips = [];
  
  //USER FAVORITES
  $scope.userFavoriteTips = [];
  
  //TOM: Qu'est ce que c'est ca?
  $.fn.select2.defaults.set("theme", "flat");
  $('.select2').select2();
  
  //COVER
  $scope.cover_is;
  
  $scope.user_tips = function(id){
    Tips.getByAuthorId(id)
      .success(function(data) {
        $scope.userTips = data;
        add_markers(data);
        $scope.count_country(data);
        $scope.tipson = true;
      
        if($scope.user_feed.profil.cover == ''){
          $scope.cover_is = $scope.userTips[$scope.userTips.length - 1].cover;
        }
        else{
          $scope.cover_is = $scope.user_feed.profil.cover;
        }
      });
  }
  
  function call_friends_tips(){
    for(var t=0; t<$scope.user_data[0].friends.length; t++){
      Tips.getByAuthorId($scope.user_data[0].friends[t])
        .success(function(data) {
          for(var z=0; z<data.length; z++){
            $scope.friendsTips.push(data[z])
            add_markers(data);
          }
        });
    }
  }
  
  function findFavorites(){
    Tips.getByArray($scope.user_feed.user_favorites)
      .success(function(data) {
        $scope.userFavoriteTips = data;
      });
  }
  
  //SHOW TIP
  $scope.show_tips = function(id){
    $location.path('tips/'+id);
  }
  
  //SHOW PLACE ON MAP WHEN PLACE GETS HOVERED
  //Triggered by ng-mouseover
  var placeLat;
  $scope.placeHover = function(id, lat){
    if(lat != placeLat){
      for(var p = 0; p<$scope.userTips.length; p++){
        if($scope.userTips[p]._id == id){
          var mPos = new google.maps.LatLng($scope.userTips[p].lat, $scope.userTips[p].lon);
          map.panTo(mPos);
          map.setZoom(15);
          
          //setting Lat variable
          placeLat = $scope.userTips[p].lat;
          
          //avoid gray area
          var center = map.getCenter();
          google.maps.event.trigger(map, "resize");
          map.setCenter(center);
          
          //$scope.allMarkers[p].setIcon(normalIcon);
          for(var y=0; y<allMarkers.length;y++){
            if(allMarkers[y].id == id){
              allMarkers[y].setOpacity(1);
            }
            else{
              allMarkers[y].setOpacity(0.5);
            }
          }
        }
        else{
          //$scope.allMarkers[p].setIcon(lowalphaIcon);
        }
      }
    }
  }
 
  //COUNT COUNTRIES
  $scope.count_country = function(data){
    $scope.count_country = [];
    for(var i=0; i<data.length; i++){
      var is_in = $.inArray(data[i].country, $scope.count_country);
      if(is_in < 0){$scope.count_country.push(data[i].country);}
    }
  }
  
  //FRIEND PANEL
  // Ordering friends by status of requests
  $scope.friend_ordering = function(friends, user){
    $scope.user_r = [];
    $scope.user_p = [];
    $scope.user_f = [];
    $scope.user_o = [];
    
    for(var i=0;i<friends.length;i++){
      var check_r = $.inArray(friends[i].id, user.user_friend_requests);
      var check_p = $.inArray(friends[i].id, user.pending_friend_requests);
      var check_f = $.inArray(friends[i].id, user.friends);
      if(check_f != -1){$scope.user_f.push(friends[i]);}
      else if(check_p != -1){$scope.user_p.push(friends[i]);}
      else if(check_r != -1){$scope.user_r.push(friends[i]);}
      else{$scope.user_o.push(friends[i]);}
    }
  }
  
  //FRIEND REQUESTS
  $scope.send_request = function(id){
    var check_user =$.inArray(id, $scope.user_data[0].user_friend_requests) > -1;
    var check_pending =$.inArray(id, $scope.user_data[0].pending_friend_requests) > -1;
    
    if(check_user != -1 && check_pending != -1){
      $scope.user_data[0].user_friend_requests.push(id);
      
      Users.update($scope.user_data[0], $scope.user_data[0]._id)
        .success(function(data) {
          //Friend side
          Users.getByFcbId(id)
            .success(function(data2){
              console.log('friend data');
              console.log(data2.length);
              
              //if friend exist
              if(data2.length > 0){
                $scope.fid = data2[0];

                check_user =$.inArray($scope.user_data[0].fcb_id, $scope.fid.user_friend_requests) > -1;
                check_pending =$.inArray($scope.user_data[0].fcb_id, $scope.fid.pending_friend_requests) > -1;

                if(check_user != -1 && check_pending != -1){
                  $scope.fid.pending_friend_requests.push($scope.user_data[0].fcb_id);

                  Users.update($scope.fid, $scope.fid._id)
                    .success(function(data3) {
                      call_fcb_friends($scope.user.id, true);
                      $scope.post_notification('new_friend_request', $scope.user_data[0], $scope.fid);
                    });
                }
              }
              
            });
        });
    }
    
  }
  
  //DELETE REQUEST
  $scope.delete_request = function(id){
    $scope.user_data[0].user_friend_requests = removeA($scope.user_data[0].user_friend_requests, id);
    Users.update($scope.user_data[0], $scope.user_data[0]._id)
        .success(function(data) {
          call_fcb_friends($scope.user.id, true);
        });
    
    Users.getByFcbId(id)
        .success(function(data){
          $scope.fid = data[0];
        
          $scope.fid.pending_friend_requests = removeA($scope.fid.pending_friend_requests, $scope.user_data[0].fcb_id);
          Users.update($scope.fid, $scope.fid._id)
              .success(function(data) {
              });
        })
        .error(function(err){
          console.log('not found');
        })
  }
  
  //VALIDATE REQUEST
  $scope.validate_request = function(id){
    var check_pending = $.inArray(id, $scope.user_data[0].pending_friend_requests) > -1;
    
    //user's side
    if(check_pending){
      var check_friends = $.inArray(id, $scope.user_data[0].friends) > -1;
      if(check_friends != -1){
        $scope.user_data[0].friends.push(id);
        $scope.user_data[0].pending_friend_requests = removeA($scope.user_data[0].pending_friend_requests, id);
        Users.update($scope.user_data[0], $scope.user_data[0]._id)
          .success(function(data) {
            //Friend's side
            Users.getByFcbId(id)
                .success(function(data2){
                  $scope.fid = data2[0];
                  var check_pending = $.inArray($scope.user_data[0].fcb_id, $scope.fid.user_friend_requests) > -1;

                  if(check_pending){
                    var check_friends = $.inArray($scope.user_data[0].fcb_id, $scope.fid.friends) > -1;
                    if(!check_friends){
                      $scope.fid.friends.push($scope.user_data[0].fcb_id);
                      $scope.fid.pending_friend_requests = removeA($scope.fid.user_friend_requests, $scope.user_data[0].fcb_id);
                      Users.update($scope.fid, $scope.fid._id)
                        .success(function(data3) {
                          call_fcb_friends($scope.user.id, true);
                          $scope.post_notification('new_friendship', $scope.user_data[0], $scope.fid);
                        });
                    }
                  }
                });
          });
      }
    }
  }
  
  //SEND NOTIFICATION
  $scope.post_notification = function(type, emitter, receiver){
    console.log(receiver);
    $scope.notif = {};
    $scope.notif.emitter_id = emitter.id;
    $scope.notif.emitter_fcb_id = emitter.fcb_id;
    $scope.notif.emitter_name = emitter.name;
    $scope.notif.receiver_id = receiver.id;
    $scope.notif.receiver_fcb_id = receiver.fcb_id;
    $scope.notif.receiver_name = receiver.name;
    $scope.notif.type = type;
    $scope.notif.url = "/user/";
    $scope.notif.date = new Date();

    Notifs.create($scope.notif)
      .success(function(data){
        console.log("NOTIF POSTED - FRIENDSHIP");
        console.log(data);
      });
  }
  
});

app.controller('tipController', function($scope, $location, $timeout, $routeParams, $http, Facebook, Tips, Users) {

  console.log($scope.loggedin);
  
  //URL HASHING
  var tip_id = $routeParams.id;

  $scope.me = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.loggedin = true;
        Facebook.api('/me?fields=id,name,email,picture,cover,hometown', function(response) {
          $scope.user = response;
          console.log($scope.user);
        });
      } else {
        $scope.loggedin = false;
        console.log("not connected with fcb");
        $location.path('/login');
      }
    });
  };

  $scope.me();
  
  
  //MAP
  initMap(false);
  
  //USER TIPS
  $scope.tips = {};
  
  Tips.getId(tip_id)
    .success(function(data) {
      console.log(data);
      $scope.tips = data;
      
      $timeout(function() { add_markers(data);}, 2000);
      Users.getByFcbId(data.author_id)
        .success(function(data){
          $scope.tips_user_data = data[0];
        })
    });
  
  $scope.itinerary = function(address){
    itineraryCheck(address);
  }

});

app.controller('newController', function($scope, $location, $http, Facebook, Shared, Upload, Tips, Notifs, Utils, Users, $routeParams) {

  $scope.loading = false;
  
  //USER INFO FOR NOTIF
  //if user not log, back to login
  var db_user = Shared.getUser();
  var is_db_user = isEmpty(db_user);
  if(is_db_user){
    $location.path("/login");
  }
  
  Facebook.getLoginStatus(function(response) {
    if(response.status === 'connected') {
      $scope.loggedin = true;
      Facebook.api('/me?fields=id,name,email,picture,cover,hometown', function(response) {
          $scope.user = response;
          console.log($scope.user);
        });
    } else {
      $scope.loggedin = false;
      console.log("not connected with fcb");
      $location.path('/login');
    }
  });
  
  
  //CONTINENTS
  $http.get('ressources/continent.json').success(function(data) {
    $scope.continent = data;
  });
  
  //EDIT
  $scope.url_id = $routeParams.id;
    console.log($scope.url_id);
    if($scope.url_id){
      console.log("id in url param"); //debug
      Tips.getId($scope.url_id)
        .success(function(data){
          console.log(data);
          $scope.tipData = data;
          console.log($scope.tipData);
        })
    }
  
  //DELETE
  $scope.deleteItem = function(id){
    if(confirm("Are you sure you want to delete this tips ?")){
      Tips.delete(id)
          .success(function(data) {
            console.log("item deleted");
          });
      $location.path('/user');
    }
  }
  
  //MAP
  initMap();

  //Form
  $.fn.select2.defaults.set("theme", "flat");
  $('.select2').select2();
  $('input[name="category"]').change(function() {
    var value = $(this).val();
    $('.category-description span').each(function() {
      if($(this).hasClass(value)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  var $locationInput = $('input#address');
  var autocomplete = new google.maps.places.Autocomplete($locationInput.get(0));

  google.maps.event.addListener(autocomplete, 'place_changed', function () {
      var place = autocomplete.getPlace();
      place.geometry.location.lat();
      place.geometry.location.lng()
  });

  google.maps.event.addDomListener($locationInput.get(0), 'keydown', function(e) {
      if (e.keyCode === 13) {
          e.preventDefault();
      }
  });

  //Focus on country
  $scope.country_focus = function(country){
    update_country(country);
  }
  
  
  //DEBUG
  Tips.get()
      .success(function(data) {
        console.log(data);
      });
  
  //Category selector
  $scope.select_cat = function(cat){
    $scope.tipData.category = cat;
  }

  $scope.geocode = function(location){
    console.log(location);
    var address = location;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      
      // If that was successful
      if (status == google.maps.GeocoderStatus.OK) {
        var location = results[0].geometry.location;
        console.log(results[0]);
        $scope.tipData.lat = location.lat();
        $scope.tipData.lon = location.lng();
        $scope.reverse_geocode($scope.tipData.lat, $scope.tipData.lon);
      }
      else{
        if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          //Set Timeout
          setTimeout(function() {
            //your code to be executed after 1 second
            $scope.geocode(location);
          }, 1000);  
        } else {
          var reason="Code "+status;
          var msg = 'address="' + search + '" error=' +reason+ '(delay='+delay+'ms)<br>';
          console.log(msg);
        } 
      }
      
    });  
    
  }
  
  $scope.reverse_geocode = function(lat,lon){
    var geocoder = new google.maps.Geocoder();  
    var latlng = new google.maps.LatLng(lat, lon);
    var city;
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      console.log(results)
        if (results[1]) {
         //formatted address
         var loc = parseGeoLocationResults(results[0]);
         $scope.tipData.city = loc.city;
         $scope.tipData.country = loc.country;
         $scope.tipData.address = loc.street_number + " " + loc.street_name + ", " + loc.city + ", " + loc.country;
         $scope.parse_continent(loc.country);
        } else {
          alert("No results found");
        }
      } else {
          if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            //Set Timeout
            setTimeout(function() {
              //your code to be executed after 1 second
              $scope.reverse_geocode(lat,lon);
            }, 1000);  
          } else {
            var reason="Code "+status;
            var msg = 'address="' + search + '" error=' +reason+ '(delay='+delay+'ms)<br>';
            console.log(msg);
            alert("Geocoder failed due to: " + status);
          } 
      }
    });
  }
  
  $scope.locateme = function(){
    console.log("searching");
    $scope.tipData.address = getMyPosition();
    console.log('done');
  }
  
  $scope.parse_continent = function(country){
    for(var i=0;i<$scope.continent.length;i++){
      var conti = Utils.toSlug($scope.continent[i].name);
      var con = Utils.toSlug(country);
      if(conti == con){
        $scope.tipData.continent = $scope.continent[i].continent;
        $scope.upload_tips();
      }
    }
  }

  //PLACE DATA HANDLING
  $scope.tipData = {};
  var uploadTip = '/upload/tip';
  $scope.tipData.category = "experience";

  $scope.upload_tips = function(){
    
    $scope.loading = true;
    
    $scope.tipData.author_id = $scope.user.id;
    $scope.tipData.author = $scope.user.name;
    
    if(!isEmpty($scope.image)){
      $scope.data = {
        images: $scope.image.cover[0]
      };
    }

    var img_data = isEmpty($scope.data);
    if(!img_data){
      Upload.upload({
        url: uploadTip,
        arrayKey: '',
        data: $scope.data,
      }).then(function(response) {
        // Adding data paths to formData object before creating route
        // MUST respect images array order
        //console.log(imagesTip);
        //console.log(response.data.files);
        if ($scope.image.cover[0] !== undefined) {
          $scope.tipData.cover = response.data.files[0].path;
        }

        //Link route to user
        if($scope.selectedAuthor !== undefined){
          $scope.tipData.author = $scope.selectedAuthor;
        }
        
        if($scope.url_id){
          Tips.update($scope.tipData, $scope.url_id)
            .success(function(data) {
                $scope.tipData = {}; // clear the form so our user is ready to enter another
                $scope.loading = false;
                //redirect to account list
                $location.path('/user');
              });
        }
        else{
          //Storing route inside DB
          Tips.create($scope.tipData)
            .success(function(data) {
              $scope.tipData = {}; // clear the form so our user is ready to enter another
              $scope.post_notification(data);

              $scope.addidtouser(data._id);

              $scope.loading = false;
              //redirect to account list
              $location.path('/user');
            });
        }
        
      });
    }
    else{
      if($scope.url_id){
          Tips.update($scope.tipData, $scope.url_id)
            .success(function(data) {
                $scope.tipData = {}; // clear the form so our user is ready to enter another

                $scope.loading = false;
                //redirect to account list
                $location.path('/user');
              });
        }
        else{
          //Storing route inside DB
          Tips.create($scope.tipData)
            .success(function(data) {
              $scope.tipData = {}; // clear the form so our user is ready to enter another

              $scope.post_notification(data);

              $scope.addidtouser(data._id);

              $scope.loading = false;
              //redirect to account list
              $location.path('/user');
            });
        }
    }

  };
  
  //BIND TIP ID TO USER
  $scope.addidtouser = function(id){
    console.log('INPUT TIPS ID IS '+ id);
    console.log(db_user);
    console.log('FACEBOOK ID IS : '+db_user[0].fcb_id);
    Users.getByFcbId(db_user[0].fcb_id)
      .success(function(data) {
      console.log('USER IS IS '+ data[0]._id);
      $scope.up_user = data[0];
      console.log(data);
      $scope.up_user.tips.push(id);
      console.log($scope.up_user);
      Users.update($scope.up_user, data[0]._id)
        .success(function(data2){
        console.log('user updated with tips id');
        console.log(data2);
      })
    });
  }
    
  //SEND NOTIFICATION
  $scope.post_notification = function(tip){
    $scope.notif = {};
    $scope.notif.emitter_id = db_user[0].id;
    $scope.notif.emitter_fcb_id = db_user[0].fcb_id;
    $scope.notif.emitter_name = db_user[0].name;
    $scope.notif.type = "new_tip";
    $scope.notif.url = "/tips/" + tip._id;
    $scope.notif.date = new Date();

    Notifs.create($scope.notif)
      .success(function(data){
        console.log("NOTIF POSTED - NEW TIPS");
      });
  }
  
  //UPLOAD CYCLE
  $scope.start_upload = function(){
     $scope.geocode($scope.tipData.address);
  }

  $scope.check = function(){
    $scope.tipData.author_id = $scope.user.id;
    console.log($scope.tipData);
  }
  
  $scope.createtip = function(){
    var tip = {
      display: true,
      author_id: "430534932",
      author: "test",
      name: "test",
      category: "test",
      continent: "test",
      country: "test",
      city: "test",
      address: "test",
      lat: "test",
      lon: "test",
      text: "test",
      cover: "test"
    }

    Tips.create(tip)
        .success(function(data) {
          console.log(data);
          console.log("TIP CREATED");

          //redirect to account list
          //$location.path('/user');
        });
  }

  $scope.find = function(){
    console.log('test');
    Tips.get()
      .success(function(data) {
        console.log(data);
      });
  };
});

app.controller('usereditController', function($scope, $routeParams, $location, $http, Utils, Users, Upload, Facebook) {

  $scope.user_data = {};
  
  //URL HASHING
  $scope.display_user = function(){
    $scope.url_id = $routeParams.id;
    if($scope.url_id){
      console.log("id in url param"); //debug
      Users.getByFcbId($scope.url_id)
        .success(function(data){
          console.log(data[0]);
          $scope.user_data = data[0];
          console.log($scope.user_data);
        })
    }
    else{
      console.log("no id in url param");
      $location.path('/user');
    }
  }
  
  $scope.upload_cover = function(){
    
    var uploadUser = '/upload/user';
    
    if (!isEmpty($scope.image_data)) {
       var data = {
          images: $scope.image_data[0]
        };

        Upload.upload({
          url: uploadUser,
          arrayKey: '',
          data: data,
        }).then(function(response) {
          console.log('img uploaded');
          // Adding data paths to formData object before creating route
          // MUST respect images array order
          //console.log(imagesTip);
          //console.log(response.data.files);
          if ($scope.image_data[0] !== undefined) {
            $scope.user_data.profil.cover = response.data.files[0].path;
          }

          console.log("UPDATING USER");
          console.log($scope.user_data);
          //Storing route inside DB
          Users.update($scope.user_data, $scope.user_data._id)
            .success(function(data) {
              $scope.user_data = {}; // clear the form so our user is ready to enter another
              console.log(data);
              console.log("USER UPDATED");
              //redirect to account list
              $location.path('/user');
            });
        });
    }
    else{
      Users.update($scope.user_data, $scope.user_data._id)
            .success(function(data) {
              $scope.user_data = {}; // clear the form so our user is ready to enter another
              console.log(data);
              console.log("USER UPDATED");
              //redirect to account list
              $location.path('/user');
            });
    }
   
  }
  
  $scope.display_user();
  
});

app.controller('tipseditController', function($scope, $routeParams, $location, $http, Utils, Users, Tips, Upload, Facebook) {

  $scope.tipData = {};
  //URL HASHING
  $scope.display_tips = function(){
    $scope.url_id = $routeParams.id;
    console.log($scope.url_id);
    if($scope.url_id){
      console.log("id in url param"); //debug
      Tips.getId($scope.url_id)
        .success(function(data){
          console.log(data);
          $scope.tipData = data;
          console.log($scope.tipData);
        })
    }
    else{
      console.log("no id in url param");
      $location.path('/user');
    }
  }
  initMap();
  $scope.display_tips();
});

app.controller('aboutController', function($scope, $location, $http, Utils) {

  $.fn.select2.defaults.set("theme", "flat");
  $('.select2').select2();

  // SERVICE DATA EX
  // Moods.getDisplay('true')
  //   .success(function(data) {
  //     //TODO: change for call integration
  //     var pending = [];
  //     for(var mood = 0; mood<data.length; mood++){
  //       if(data[mood].moodtype != 'itinerary'){
  //         pending.push(data[mood]);
  //       }
  //     }
  //     $scope.moods = pending;
  //     $scope.displayedMoods = $scope.moods;
  //   });
  
  
});
