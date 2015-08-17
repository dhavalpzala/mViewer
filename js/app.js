var Vue = require("vue"),
    VueRouter = require("vue-router"),
    dbClient = new Database();
// Tell Vue to use view-router
Vue.use(VueRouter)

// Router options
var router = new VueRouter({
   history: false
})

// Router map for defining components
// You can use template:  require('/path/to/component.html')
router.map({
   // For Not Found template
   '*': {
      component: require('../js/login.js')
   },

   '/': {
     component: require('../js/login.js')
   },

   '/home': {
      component: require('../js/home.js')
   }
});

var App = Vue.extend()

router.start(App, '#app')
