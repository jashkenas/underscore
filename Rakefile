desc "Use Uglify JS to compress Underscore.js"
task :build do
  sh "uglifyjs underscore.js -c \"evaluate=false\" --comments \"/    .*/\" -m -o underscore-min.js"
end

desc "Build the docco documentation"
task :doc do
  sh "docco underscore.js"
end

desc "Keep component.json up-to-date with package.json"
task :component_json do
  require 'json'

  def load_json_file(filename)
    JSON.parse(IO.read(filename))
  end

  def save_json_file(filename, obj)
    File.open(filename, "w") do |f|
      f.write(JSON.pretty_generate(obj))
    end
  end

  # Use package.json as the starting point
  component = load_json_file("package.json")

  # Delete keys not relevant for component.json
  component.delete("homepage")
  component.delete("repository")
  component.delete("devDependencies")
  component.delete("scripts")

  # Add required keys to component.json
  component["repo"] = "documentcloud/underscore"
  component["scripts"] = [component['main']]

  # Add namespaced comment about not editing component.json manually.
  component["underscore_comment"] = "Don't edit this component.json directly. It is automatically built from package.json via 'rake component_json'."

  # Save component.json
  save_json_file("component.json", component)
end