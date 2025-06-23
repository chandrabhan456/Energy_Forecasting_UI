importScripts('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js');
self.onmessage = function(e) {
  Papa.parse(e.data, {
    complete: function(results) {
      self.postMessage(results.data.slice(0, 1000));
    }
  });
};
