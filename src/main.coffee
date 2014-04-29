Yuser = require './yuser'
root = require './root'
route = require './router'

root.register Yuser

root.ready = route
