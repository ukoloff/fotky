Yuser = require './yuser'
Guser = require './goo'
root = require './root'
route = require './router'

root.register Yuser, Guser

root.ready = route
