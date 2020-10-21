(function() {
  var functions = document.querySelectorAll('[data-name]');
  var sections = document.querySelectorAll('.searchable_section');
  var searchInput = document.getElementById('function_filter');

  function searchValue() {
    return searchInput.value.trim().replace(/^_\.?/, '');
  }

  function strIn(a, b) {
    return b.toLowerCase().indexOf(a.toLowerCase()) >= 0;
  }

  function doesMatch(element) {
    var name = element.getAttribute('data-name');
    var aliases = element.getAttribute('data-aliases') || '';
    var value = searchValue();
    return strIn(value, name) || strIn(value, aliases);
  }

  function filterElement(element) {
    element.style.display = doesMatch(element) ? '' : 'none';
  }

  function filterToc() {
    _.each(functions, filterElement);

    var emptySearch = searchValue() === '';

    // Hide the titles of empty sections
    _.each(sections, function(section) {
      var sectionFunctions = section.querySelectorAll('[data-name]');
      var showSection = emptySearch || _.some(sectionFunctions, doesMatch);
      section.style.display = showSection ? '' : 'none';
    });
  }

  function gotoFirst() {
    var firstFunction = _.find(functions, doesMatch);
    if (firstFunction) {
      window.location.hash = firstFunction.getAttribute('data-name');
      searchInput.focus();
    }
  }

  searchInput.addEventListener('input', filterToc, false);

  // Press "Enter" to jump to the first matching function
  searchInput.addEventListener('keypress', function(e) {
    if (e.which === 13) {
      gotoFirst();
    }
  });

  // Press "/" to search
  document.body.addEventListener('keyup', function(event) {
    if (191 === event.which) {
      searchInput.focus();
    }
  });
}());
