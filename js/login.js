var Vue = require("vue");
var dbClient = new Database();
var template = require(['text!../views/templates/login.html'], function(html){

});

module.exports = Vue.component('login', {
  template: "<p>hello</p>",
  methods: {
    login: function(e) {
        e.preventDefault();
        var url = this.getConnectionUrl(),
            vm = this;
        //databaseVM.connect(url, this.$data);
        dbClient.connect(url).then(function(){

        });
    },
    getConnectionUrl: function() {
        return "mongodb://" + this.$data.host + ":" + this.$data.port;
    }
  }
});
