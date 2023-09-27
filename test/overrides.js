(function() {
  function overrideDataView() {
    NativeDataView = DataView;
    DataView = {};
  }

  // Only override browser functions roughly 1/3rd of the time
  var runOverrides = Math.floor(Math.random() * 3) === 0;
  if (runOverrides) {
    overrideDataView();
  }
})();
