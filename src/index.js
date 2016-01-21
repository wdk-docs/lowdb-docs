var Vue = require('vue')
var low = require('lowdb')
window.db = low('db')

Vue.filter('stringify', function (value) {
  return JSON.stringify(value, null, 2)
})

Vue.filter('highlight', function (value) {
  return hljs.highlight('json', value).value
})

var vm = new Vue({
  el: '#app',
  data: {
    code: '',
    error: '',
    output: '',
    object: db.object
  },
  methods: {
    eval: function () {
      this.error = ''
      this.output = ''

      try {
        this.output = eval(this.code)
        this.object = Object.assign({}, db.object)
      } catch (e) {
        this.error = e.message
      }
    },
    reset: function () {
      db.object = {}
      this.code = code
      this.output = ''
      this.object = Object.assign({}, db.object)
    }
  }

})

var code = vm.code = [
  "db('posts').push({",
  "  id: db('posts').size() + 1,",
  "  title: 'lowdb'",
  "})",
  "",
  "// Try to uncomment some of the code below",
  "",
  "// db('posts').find({ id: 1 })",
  "// db('posts').find({ title: 'lowdb' })",
  "// db('posts').last()",
  "// db('posts').orderBy('id', 'desc')",
  "",
  "// db('comments').push({ text: 'some comment'})"
].join('\n')
