require 'rubygems'
require 'uglifier'

desc "Use the Closure Compiler to compress Underscore.js"
task :build do
  `./build > underscore.js`
  source  = File.read('underscore.js')
  min     = Uglifier.compile(source)
  File.open('underscore-min.js', 'w') {|f| f.write min }
end

desc "Build the docco documentation"
task :doc do
  sh "docco underscore.js"
end

desc "Run the dev server for testing"
task :test do
  puts 'open localhost:3000/test/ in a browser to run tests'
  system 'node dev_server.js'
end
