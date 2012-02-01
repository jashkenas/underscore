require 'rubygems'
require 'closure-compiler'

HEADER = /((^\s*\/\/.*\n)+)/

desc "Use the Closure Compiler to compress Underscore.js"
task :build do
  source  = File.read('underscore.js')
  header  = source.match(HEADER)
  min     = Closure::Compiler.new.compress(source)
  File.open('underscore-min.js', 'w') do |file|
    file.write header[1].squeeze(' ') + min
  end
end

desc "Build the docco documentation"
task :doc do
  sh "docco underscore.js"
  sh 'perl -pe "s|\(#([\d]+)\)|<a href=\'https://github.com/documentcloud/underscore/issues/\1\'>(#\1)</a>|g" index.html.in  > index.html'
end

