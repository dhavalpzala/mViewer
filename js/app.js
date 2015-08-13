
// var pages = { login: 1 , home: 2 }
// var currentPage = pages.login;
//
// var pageVM =
var Vue = require("vue"),
Route = require('vue-route');

Vue.use(Route);

var routes = new Vue({
  el: 'body',
  routes: {
    '/login': {
      componentId: "login",
      isDefault: true
    },
    '/index': {
      componentId: 'home'
    }
  },
  options: {
    hashbang: true
  },
  defaultRoute: "/login"
});
