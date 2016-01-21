var Vue = require('vue')
var low = require('lowdb')
window.db = low('db')

var initialCode = [
  "// db is also available in the console",
  "db('posts').push({",
  "  id: db('posts').size() + 1,",
  "  title: 'some post'",
  "})",
  "",
  "// Try to uncomment some of the code below",
  "",
  "// db('posts').find({ id: 5 })",
  "// db('posts').find({ title: 'some post' })",
  "// db('posts').last()",
  "// db('posts').orderBy('id', 'desc')",
  "",
  "// db('comments').push({ text: 'some comment'})"
].join('\n')

var editor = CodeMirror.fromTextArea(document.getElementById('code'),  {
  theme: 'material',
})

editor.getDoc().setValue(initialCode)

Vue.filter('stringify', function (value) {
  if (value === undefined) return 'undefined'
  return JSON.stringify(value, null, 2)
})

Vue.filter('highlight', function (value) {
  return hljs.highlight('json', value).value
})

var vm = new Vue({
  el: '#app',
  data: {
    error: '',
    output: '',
    object: db.object
  },
  methods: {
    eval: function () {
      this.error = ''
      this.output = ''

      try {
        this.output = eval(editor.getValue())
        this.object = Object.assign({}, db.object)
      } catch (e) {
        this.error = e.message
      }
    },
    reset: function () {
      editor.getDoc().setValue(initialCode)
      db.object = {}
      this.output = ''
      this.object = Object.assign({}, db.object)
    }
  }
})
