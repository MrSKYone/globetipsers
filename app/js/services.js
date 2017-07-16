app.factory('Utils', function(){
	return{
		isSmallDevice: function(){
			var isSmallDevice = false;
			if($(window).width() < 800){
			    isSmallDevice=true;
			} else{
			    isSmallDevice=false;
			};
			$(window).resize(function(){
			    if($(window).width() < 800){
			        isSmallDevice=true;
			    } else{
			        isSmallDevice=false;
			    };
			});
			return isSmallDevice;
		},
		toSlug: function(str){
			str = str.replace(/^\s+|\s+$/g, ''); // trim
			str = str.toLowerCase();

			// remove accents, swap ñ for n, etc
			var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
			var to   = "aaaaeeeeiiiioooouuuunc------";
			for (var i=0, l=from.length ; i<l ; i++) {
				str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
			}

			str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
				.replace(/\s+/g, '-') // collapse whitespace and replace by -
				.replace(/-+/g, '-'); // collapse dashes

			return str;
		},
		duplicates: function(arr){
			var n, y, x, i, r;
			var arrResult = {},
				unique = [];
			for (i = 0, n = arr.length; i < n; i++) {
				var item = arr[i];
				arrResult[item._id] = item;
			}
			i = 0;
			for (var item in arrResult) {
				unique[i++] = arrResult[item];
			}
			return unique;
		}
	}
});

//ORDER OBJECT BY
app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});

app.service('Download', function ($http) {
  return {
		dl : function(data) {
			return $http.post('/download', data);
		}
	}
})


app.factory('Tips', ['$http' ,function($http) {
	return {
		get : function() {
			return $http.get('/api/tips');
		},
		getId : function(id) {
			return $http.get('/api/tips/' + id);
		},
		getByAuthorId : function(id) {
			return $http.get('/api/tips/field/author/' + id);
		},
		getName : function(slug) {
			return $http.get('/api/tips/name/' + slug);
		},
		search: function(string) {
			return $http.get('/api/tips/search/' + string);
		},
		create : function(tipData) {
			return $http.post('/api/tips', tipData);
		},
		update : function(tipData, id) {
			return $http.put('/api/tips/' + id, tipData);
		},
		delete : function(id) {
			return $http.delete('/api/tips/' + id);
		}
	}
}]);

app.factory('Users', ['$http' ,function($http) {
	return {
		get : function() {
			return $http.get('/api/users');
		},
		getId : function(id) {
			return $http.get('/api/users/' + id);
		},
		getByFcbId : function(id) {
			return $http.get('/api/users/field/fcb_id/' + id);
		},
		search: function(string) {
			return $http.get('/api/users/search/' + string);
		},
		create : function(userData) {
			return $http.post('/api/users', userData);
		},
		update : function(userData, id) {
			return $http.put('/api/users/' + id, userData);
		},
		delete : function(id) {
			return $http.delete('/api/users/' + id);
		}
	}
}]);

app.factory('Notifs', ['$http' ,function($http) {
	return {
		get : function() {
			return $http.get('/api/notifs');
		},
		getId : function(id) {
			return $http.get('/api/notifs/' + id);
		},
		getByFcbId : function(id) {
			return $http.get('/api/notifs/field/fcb_id/' + id);
		},
		getByUserId : function(id) {
			return $http.get('/api/notifs/field/user_id/' + id);
		},
		create : function(notifData) {
			return $http.post('/api/notifs', notifData);
		},
		update : function(notifData, id) {
			return $http.put('/api/notifs/' + id, notifData);
		},
		delete : function(id) {
			return $http.delete('/api/notifs/' + id);
		}
	}
}]);

app.service('Download', function ($http) {
  return {
		dl : function(data) {
			return $http.post('/download', data);
		}
	}
})

app.service('Shared', function () {
		var property = {};

		return {
				getUser: function () {
						return property;
				},
				setUser: function(value) {
						property = value;
				}
		};
});

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

