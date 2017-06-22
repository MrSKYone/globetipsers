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

  .when('/user', {
    templateUrl: 'pages/user.html',
    controller: 'userController'
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

app.controller('globalController', function($scope, $location, $http, Facebook) {

  $scope.loggedin = false;
  
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
    });
  };

});

app.controller('userController', function($scope, $location, $http, Facebook, Shared, Tips, Users) {

  
  //FACEBOOK LOGIN
  console.log($scope.loggedin);

  $scope.me = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.loggedin = true;
        Facebook.api('/me?fields=id,name,email,picture,cover,hometown', function(response) {
          $scope.user = response;
          console.log($scope.user);
          $scope.bind_user($scope.user);
          $scope.user_tips($scope.user.id);
          Facebook.api('/'+$scope.user.id+'/friends?fields=name,id,picture', function(response) {
            $scope.user_friends = response.data;
            console.log(response);
          });
        });
      } else {
        $scope.loggedin = false;
        console.log("not connected with fcb");
        $location.path('/login');
      }
    });
  };

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
            });
        }
        else{
           console.log("USER EXIST");
           Shared.setUser(data);
          console.log(data);
        }
      });
  }
  
  $scope.me();
  
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
  $scope.userTips = {};
  
  
  $scope.user_tips = function(id){
    Tips.getByAuthorId(id)
      .success(function(data) {
        console.log(data);
        $scope.userTips = data;
        add_markers(data);
        $scope.count_country(data);
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
});

app.controller('tipController', function($scope, $location, $routeParams, $http, Facebook, Tips) {

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
  initMap();
  
  //USER TIPS
  $scope.tips = {};
  
  Tips.getId(tip_id)
    .success(function(data) {
      console.log(data);
      $scope.tips = data;
      add_markers(data);
    });

});

app.controller('newController', function($scope, $location, $http, Facebook, Shared, Upload, Tips, Notifs) {

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
  
  //MAP
  initMap();
  
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
      var location = results[0].geometry.location;
      console.log(results[0]);
      $scope.tipData.lat = location.lat();
      $scope.tipData.lon = location.lng();
      $scope.reverse_geocode($scope.tipData.lat, $scope.tipData.lon);
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
         $scope.upload_tips();
        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  }

  //PLACE DATA HANDLING
  $scope.tipData = {};
  var uploadTip = '/upload/tip';
  $scope.tipData.category = "experience";

  $scope.upload_tips = function(){
    
    $scope.tipData.author_id = $scope.user.id;
    $scope.tipData.author = $scope.user.name;

    var data = {
      images: $scope.image.cover[0]
    };

    Upload.upload({
      url: uploadTip,
      arrayKey: '',
      data: data,
    }).then(function(response) {
      console.log('img uploaded');
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
      
      console.log("CREATING TIP");
      console.log($scope.tipData);
      //Storing route inside DB
      Tips.create($scope.tipData)
        .success(function(data) {
          $scope.tipData = {}; // clear the form so our user is ready to enter another
          console.log(data);
          console.log("TIP CREATED");
        
          $scope.post_notification(data);
        
          //redirect to account list
          //$location.path('/user');
        });
    });

  };
    
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
