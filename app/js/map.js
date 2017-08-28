var map;
var allMarkers = [];

//INIT MAP
function initMap(userloc) {
  var mapOptions = {
    zoom: 3,
    center: new google.maps.LatLng(45.529428, -73.5912335)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var infoWindow = new google.maps.InfoWindow({map: map});

    google.maps.event.addListener(map, 'zoom_changed', function() {
        var zoom = map.getZoom();
        var scale = 50;
console.log(zoom);
        if(zoom > 5) {
            scale = scale * 0.8;
        } else if(zoom > 10) {
            scale = scale * 0.6;
        }

        for(var i = 0; i < allMarkers.length; i++) {
            var icon = allMarkers[i].getIcon();
            icon.scaledSize = new google.maps.Size(scale, scale);
            allMarkers[i].setIcon(icon);
            // allMarkers[i].setIcon().setScaledSize(new google.maps.Size(38,38))
        }
    });
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Vous êtes ici.');
      if(!userloc){
        map.setCenter(pos);
      }
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
    // Resize map to cover div sizing changes
    google.maps.event.trigger(map, 'resize'); 
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function update_location(lat,lon){
  var mPos = new google.maps.LatLng(lat, lon);
  map.panTo(mPos);
  map.setZoom(15);

  //avoid gray area
  var center = map.getCenter();
  google.maps.event.trigger(map, "resize");
  map.setCenter(center);
}

function update_country(country){
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( {'address' : country}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
          map.panTo(results[0].geometry.location);
          map.setZoom(5);
          var center = map.getCenter();
          google.maps.event.trigger(map, "resize");
          map.setCenter(center);
      }
  });
}

function parseGeoLocationResults(result) {
    var parsedResult = {}
    var {address_components} = result;

    for (var i = 0; i < address_components.length; i++) {
        for (var b = 0; b < address_components[i].types.length; b++) {
            if (address_components[i].types[b] == "street_number") {
                //this is the object you are looking for
                parsedResult.street_number = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "route") {
                //this is the object you are looking for
                parsedResult.street_name = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "sublocality_level_1") {
                //this is the object you are looking for
                parsedResult.sublocality_level_1 = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "sublocality_level_2") {
                //this is the object you are looking for
                parsedResult.sublocality_level_2 = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "sublocality_level_3") {
                //this is the object you are looking for
                parsedResult.sublocality_level_3 = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "neighborhood") {
                //this is the object you are looking for
                parsedResult.neighborhood = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "locality") {
                //this is the object you are looking for
                parsedResult.city = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "administrative_area_level_1") {
                //this is the object you are looking for
                parsedResult.state = address_components[i].long_name;
                break;
            }

            else if (address_components[i].types[b] == "postal_code") {
                //this is the object you are looking for
                parsedResult.zip = address_components[i].long_name;
                break;
            }
            else if (address_components[i].types[b] == "country") {
                //this is the object you are looking for
                parsedResult.country = address_components[i].long_name;
                break;
            }
        }
    }
    return parsedResult;
}

function add_markers(places){
  
  var expIcon = {
    url: "images/pictos/experience-B.png",
    scaledSize: new google.maps.Size(40,40)
  }
  
  var exploreIcon = {
    url: "images/pictos/explore-B.png",
    scaledSize: new google.maps.Size(40,40)
  }
  
  var globeIcon = {
    url: "images/pictos/globe-B.png",
    scaledSize: new google.maps.Size(40,40)
  }
  
  var sleepIcon = {
    url: "images/pictos/sleep-B.png",
    scaledSize: new google.maps.Size(40,40)
  }
  
  var tasteIcon = {
    url: "images/pictos/taste-B.png",
    scaledSize: new google.maps.Size(40,40)
  }
  
  var lowalphaIcon = {
    url: "images/add-tips.png",
    scaledSize: new google.maps.Size(38,38)
  }
  
  var normalIcon = {
    url: "images/logo-min.png",
    scaledSize: new google.maps.Size(38,38)
  }
  
  for(var i=0; i<places.length;i++){
    var placeLocation = new google.maps.LatLng(places[i].lat, places[i].lon);
    var pId = places[i]._id;
    var name = places[i].category;
    
    var icon;
    if(places[i].category == "experience"){icon = expIcon;}
    else if(places[i].category == "explore"){icon = exploreIcon;}
    else if(places[i].category == "globe"){icon = globeIcon;}
    else if(places[i].category == "sleep"){icon = sleepIcon;}
    else{icon = tasteIcon;}
    
    var marker = new google.maps.Marker({
           id: pId,
           position: placeLocation,
           map: map,
           title: name,
           icon: icon
    });
    
    //MARKER'S CLICK EVENT 
  google.maps.event.addListener(marker, 'click', function() {

    //UPDATE INFO TILE
    var eNum = this.id;
    var cat = this.name;
    for(var i=0;i<places.length;i++){
      if(places[i]._id == eNum){
        allMarkers[i].setOpacity(1);
      }
      else{
        allMarkers[i].setOpacity(0.5);
      }
    }

    //SCROLL AND DISPLAY
    $('[data-id='+eNum+']').focus();
    
    
    
    var container = $('#colright');
    var scrollTo = $('[data-id='+eNum+']');

    // Or you can animate the scrolling:
    container.animate({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - 40
    });

    //MARKER POSITION
    var mPos = this.getPosition();
    //Adjustez map zoom if on mobile
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        var mobile_adjuster = new google.maps.LatLng(mPos.lat() - 0.003, (mPos.lng()));
        map.panTo(mobile_adjuster);
    }
    else{
        map.panTo(mPos);
    }
    map.setZoom(15);
  });

  allMarkers.push(marker);
  }
  
  
  if("undefined" === typeof places.length){
    var mPos = new google.maps.LatLng(places.lat, places.lon);
    
    var p = places._id;
    var n = places.name;
    
    var iconIs;
    if(places.category == "experience"){iconIs = expIcon;}
    else if(places.category == "explore"){iconIs = exploreIcon;}
    else if(places.category == "globe"){iconIs = globeIcon;}
    else if(places.category == "sleep"){iconIs = sleepIcon;}
    else{iconIs = tasteIcon;}
    
    var m = new google.maps.Marker({
           id: p,
           position: mPos,
           map: map,
           title: n,
           icon: iconIs
    });
    
    map.panTo(mPos);
    map.setZoom(15);

    //avoid gray area
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  }
  else{
    var mPos = new google.maps.LatLng(places[0].lat, places[0].lon);

    map.panTo(mPos);
    map.setZoom(3);

    //avoid gray area
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  }
}

/////////////
//ITINERARY//
/////////////
// TODO : Refactor general getCurrentPosition

// Global variable storing place location
var globalAddress = "lat,lng"

function itineraryCheck(address){
    globalAddress = address
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locatedItinerary, emptyItinerary);
    }
}

function locatedItinerary(position){
    var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    var url = "http://maps.google.com/maps?saddr="+pos.lat+","+pos.lng+"&daddr="+globalAddress;
    var win = window.open(url, '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
    } else {
        //Browser has blocked it
        alert('Please allow popups for this website (see url bar)');
    }
}

function emptyItinerary(){
    var url = "http://maps.google.com/maps?saddr=&daddr="+globalAddress;
    var win = window.open(url, '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
    } else {
        //Browser has blocked it
        alert('Please allow popups for this website (see url bar)');
    }
  
}
