require 'rubygems'
require 'uglifier'

desc "Use the Closure Compiler to compress Underscore.js"
task :build do
  source  = File.read('underscore.js')
  min     = Uglifier.compile(source)
  File.open('underscore-min.js', 'w') {|f| f.write min }
end

desc "Build the docco documentation"
task :doc do
  sh "docco underscore.js"
end

