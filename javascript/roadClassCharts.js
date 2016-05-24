/*
 * prep the data for populating the road data charts
 */
function prepRoadDataForCharts() {
  window.data = {labels: [], data: []};
  window.sortable = [];
  var countries = getAllRoadData();
  Object.keys(countries).forEach(function (iso3) {
    var country = countries[iso3];

    sortable.push({label: country.name, country: country});

  });

  sortable.sort(function (a, b) {
    return (a.country.records.total < b.country.records.total) ? 1 : -1;
  });
}

/*
 * Populate the road data chart
*/
function populateRoadDataChart() {
    window.data.labels = sortable.map(function (item) {
    return item.label;
  });

  var sources = ['motorway', 'trunk', 'pmary', 'secondary', 'tertiary', 'unclassified', 'residential',  'serviceother'];
  var sources_colors = {
    'motorway':     '#ba1ab2',
    'pmary':        '#6ea0a4',
    'residential':  '#04ab76', 
    'secondary':    '#e67722',
    'serviceother': '#bc442a', 
    'tertiary':     '#910532', 
    'trunk':        '#eae73f',
    'unclassified': '#aebcff'
  };

  sources.forEach(function (source) {
    data[source] = window.sortable.map(function (item) {
      return item.country.records[source] / item.country.records.total * 100;
    });
  });
  var datasets = [];
  sources.forEach(function (source) {
    datasets.push({
      label: source,
      data: window.data[source],
      backgroundColor: sources_colors[source]
    })
  });

  var ctx2 = document.getElementById("road-class-by-country").getContext('2d');
  new Chart(ctx2, {
    type: 'bar',
    options: {
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            autoSkip: false
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            max: 100
          }
        }]
      }
    },
    data: {
      labels: window.data.labels,
      datasets: datasets
    }
  });
}
