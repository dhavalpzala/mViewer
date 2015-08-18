var Vue = Vue || require("vue");
Vue.component('prompt', {
  data: function(){
    return {
      promptInput: ""
    }
  },
  props: ['id','header','when-added'],
  methods: {
    close: function(){
      this.$data.promptInput = "";
      $("#"+this.id).modal("hide");
    },
    callback: function(){
      var promise = this.whenAdded(this.$data.promptInput), self= this;
      if(promise)
      {
        promise.then(function(){
          self.close();
        })
      }
      else{
        self.close();
      }
    }
  },
  template: '#promptTemplate'
});
