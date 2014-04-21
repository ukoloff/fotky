through = require 'through'
coffee = require 'coffee-script'
path = require 'path'

module.exports = (file)->
  if '.coffee' != path.extname file
    return through()
  data = ''
  write = (buf)-> data+=buf
  end = ->
    stream.queue try
      coffee.compile data, bare: true
    catch e
      coffee.compile """
        throw SyntaxError '''
          #{q file}(#{e.location.first_line+1}:#{e.location.first_column+1}): #{q e.message}
        '''
      """, bare: true
    stream.queue null
  stream = through write, end

q = (s)->
  String(s).replace /['\\]/g, '\\$&'
