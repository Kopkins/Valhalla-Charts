/*
 * prep the data for populating the country data charts
 */
function prepCountriesDataForCharts() {
  window.data = {labels: [], data: []};
  window.sortable = [];
  var countries = getAllCountryData();
  Object.keys(countries).forEach(function (iso3) {
    var country = countries[iso3];

    country.people_per_address = (country.population > 0 && country.records.address > 0) ? (country.population / country.records.address) : 9999999;
    country.address_per_person = (country.population > 0 && country.records.address > 0) ? (country.records.address / country.population) : 0;
    country.people_per_venue = (country.population > 0 && country.records.venue > 0) ? (country.population / country.records.venue) : 9999999;
    country.venue_per_person = (country.population > 0 && country.records.venue > 0) ? (country.records.venue / country.population) : 0;

    // add data to the sortable so we can get it later
    if (country.address_per_person > 0.008) {
      sortable.push({label: country.name, value: country.address_per_person, country: country});
    }
  });

  sortable.sort(function (a, b) {
    return (a.value < b.value) ? 1 : -1;
  });
}

/*
 * prep the data for populating the road data charts
 */
function prepRoadDataForCharts() {
  window.rdata = {labels: [], data: []};
  window.rsortable = [];
  var countries = getAllRoadData();
  Object.keys(countries).forEach(function (iso3) {
    var country = countries[iso3];

    rsortable.push({label: country.name, country: country});

  });

  rsortable.sort(function (a, b) {
    return (a.country.records.total < b.country.records.total) ? 1 : -1;
  });
}


/**
 * Create the top countries by source chart
 */
function populateTopBySourceChart() {
  window.data.labels = sortable.map(function (item) {
    return item.label;
  });
  window.data.addrData = sortable.map(function (item) {
    return item.value;
  });

  var sources = ['openaddresses', 'openstreetmap', 'whosonfirst', 'geonames'];
  var sources_colors = {
    'openaddresses': '#d4645c',
    'openstreetmap': '#6ea0a4',
    'whosonfirst':   '#e6ead2',
    'geonames':      '#d3c756'
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

  var ctx2 = document.getElementById("top-countries-by-source").getContext('2d');
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

/*
 * Populate the road data chart
*/
function populateRoadDataChart() {
    window.rdata.labels = rsortable.map(function (item) {
    return item.label;
  });

  var sources = ['motorway', 'pmary', 'residential', 'secondary', 'serviceother', 'tertiary', 'trunk', 'unclassified'];
  var sources_colors = {
    'motorway':     '#d464fd',
    'pmary':        '#6ea0a4',
    'residential':  '#04ab76', 
    'secondary':    '#e67722',
    'serviceother': '#bc442a', 
    'tertiary':     '#89364f', 
    'trunk':        '#d3c756',
    'unclassified': '#606060'
  };

  sources.forEach(function (source) {
    rdata[source] = window.rsortable.map(function (item) {
      return item.country.records[source] / item.country.records.total * 100;
    });
  });
  var datasets = [];
  sources.forEach(function (source) {
    datasets.push({
      label: source,
      data: window.rdata[source],
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
      labels: window.rdata.labels,
      datasets: datasets
    }
  });
}