fs = require 'fs'
coffee = require 'coffee-script'
uglify = require 'uglify-js'
idx = require './index'

idx (files)->
  fs.writeFileSync out = __dirname+'/../fotky.js', ''
  for f in files
    console.log "Compiling: #{f.name} @#{f.order}..."
    src = fs.readFileSync f.path, encoding: 'utf-8'
    if f.cs
      src = try
        coffee.compile src
      catch e
        console.error "# #{f.name}(#{e.location.first_line+1}:#{e.location.first_column+1}): #{e.message}"
        src = coffee.compile """
          console.error '''
          Syntax error at #{f.name}(#{e.location.first_line+1}:#{e.location.first_column+1}): #{e.message.replace /[\\']/g, '\\$&'}
          '''
        """, bare: true
    src = try
      uglify.minify src, fromString: true
    catch e
      console.error "# #{f.name}(#{e.line}:#{e.col}): #{e.message}"
      code: coffee.compile """
        console.error '''
        Syntax error at #{f.name}(#{e.line}:#{e.col}): #{e.message.replace /[\\']/g, '\\$&'}
        '''
      """, bare: true
    fs.appendFileSync out = __dirname+'/../fotky.js', src.code+'\n'
