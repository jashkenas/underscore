desc "Use Uglify JS to compress Underscore.js"
task :build do
  sh "uglifyjs underscore.js -c \"evaluate=false\" -m -o underscore-min.js"
end

desc "Build the docco documentation"
task :doc do
  sh "docco underscore.js"
end

