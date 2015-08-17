module.exports = {
  template: '#loginTemplate',
  data: function () {
    return {
      host: "127.0.0.1", // default Values
      port: "27017", // default Values
      username: "",
      password: "",
      database: "",
      loginError: false,
    }
  },
  methods: {
    login: function(e) {
      e.preventDefault();
      var url = this.getConnectionUrl();

      dbClient.connect(url).then(function(){
          router.replace("/home");
      });
    },
    getConnectionUrl: function() {
      return "mongodb://" + this.$data.host + ":" + this.$data.port;
    }
  }
};
