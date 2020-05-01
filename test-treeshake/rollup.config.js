module.exports = [{
  input: 'map.js',
  output: {
    file: 'map-umd.js',
    format: 'umd',
    name: 'map',
  },
}, {
  input: 'template.js',
  output: {
    file: 'template-umd.js',
    format: 'umd',
    name: 'template',
  },
}];
