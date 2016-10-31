webpack = require 'webpack'
ugly = require './ugly'

@entry =
  x: "./src"

@output =
  path: "tmp",
  filename: "fotky.js"
  sourcePrefix: ''  # Fix for withOut

values = (map)->
  v for k, v of map

@module =
  loaders: values
    coffee:
      test: /[.]coffee$/
      loader: "coffee"
    litcoffee:
      test: /[.](litcoffee|coffee[.]md)$/
      loader: "coffee?literate"

brk = (s)->
  s.split ' '

@resolve =
  extensions: brk " .js .coffee .litcoffee .coffee.md"

@plugins = values
  ugly: new ugly
    output:
      max_line_len: 128
    compress:
      warnings: false
  globals: new webpack.ProvidePlugin require './autoload'
