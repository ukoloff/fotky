#
# order: 1
#
$ = ->

me = -> $.apply this, arguments

me.noconflict = @$

@$ = me
