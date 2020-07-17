import Vue from 'vue'
import index from './index.vue'

new Vue({
  el: '#app',
  mounted: function () {
    console.log('Hello Webpack and Vue !')
  },
  components: { index },
  template: '<index/>'
})
