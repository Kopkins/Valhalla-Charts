/*
 * prep the data for populating the road data charts
 */
function prepRoadDataForCharts() {
  window.data = {labels: []};
  window.sortable = [];
  var countries = getAllRoadData();
  var maxSources = ['Motorway', 'Primary', 'Secondary', 'Trunk'];  
  var namedSources = ['Residential', 'Unclassified'];
  var classSources = {
  'Motorway': 'motorway',
  'Primary': 'pmary',
  'Secondary': 'secondary',
  'Trunk': 'trunk',
  'Residential': 'residential',
  'Unclassified': 'unclassified'};
  Object.keys(countries).forEach(function (iso) {
    var country = countries[iso];
    country.max_percent = {};
    country.named_percent = {};

    maxSources.forEach(function(source) {
      country.max_percent[source] = (country.maxspeed[source] < country.classinfo[classSources[source]])
      ? country.maxspeed[source] / country.classinfo[classSources[source]] * 100
      : (country.classinfo[classSources[source]] == 0) ? 0 : 100;
    });
    
    namedSources.forEach(function(source) {
      country.named_percent[source] = (country.named[source] < country.classinfo[classSources[source]])
      ? country.named[source] / country.classinfo[classSources[source]] * 100
      : (country.classinfo[classSources[source]] == 0) ? 0 : 100;
    });

    sortable.push({label: country.name, country: country});
  });
  
}

/*
 * Populate the road data chart
*/
function populateRoadDataChart() {
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

  window.data.labels = sortable.map(function (item) {
    return item.label;
  });

  sources.forEach(function (source) {
    data[source] = window.sortable.map(function (item) {
      return item.country.classinfo[source] / item.country.classinfo.total * 100;
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

function setupMaxSpeed() {
  var typeSelect = document.getElementById('typeSelect');
  var types = ['Motorway', 'Primary', 'Secondary', 'Trunk'];

  typeSelect.addEventListener('awesomplete-selectcomplete', function (e) {
    console.log('selection changed to ', e.text.label);

    document.getElementById('high-class-road-maxspeed').remove();
    var newcanvas = document.createElement('canvas');
    newcanvas.setAttribute('id', 'high-class-road-maxspeed');
    document.getElementById('maxspeed-container').appendChild(newcanvas);

    populateMaxSpeedChart(e.text.label);
  });

  new Awesomplete(typeSelect, {list: types});

  populateMaxSpeedChart('Motorway');
}

function populateMaxSpeedChart(type) {
  var classSources = {
    'Motorway': 'motorway',
    'Primary': 'pmary',
    'Secondary': 'secondary',
    'Trunk': 'trunk'};
  var sources_colors = {
    'Motorway':  '#d4645c',
    'Primary':   '#6ea0a4',
    'Secondary': '#462272',
    'Trunk':     '#d3c756'
  };
  
  sortable.sort(function (a, b) {
    return b.country.max_percent[type] - a.country.max_percent[type];
  });
  data[type] = window.sortable.map(function (item) {
    return item.country.max_percent[type];
  });
  window.data.labels = sortable.map(function (item) {
    return item.label;
  });

  var datasets = [];
  datasets.push({
    label: type,
    data: window.data[type],
    backgroundColor: sources_colors[type]
  });

  var ctx = document.getElementById("high-class-road-maxspeed").getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: datasets
    },
    options: {
      scales: {
        xAxes: [{
          stacked: false,
          ticks: {
            autoSkip: false
          }
        }],
        yAxes: [{
          stacked: false,
          ticks: {
            max: 100
          }
        }]
      }
    }
  });
}

function setupNamed() {
  var typeSelect = document.getElementById('named_typeSelect');
  var types = ['Residential', 'Unclassified'];

  typeSelect.addEventListener('awesomplete-selectcomplete', function (e) {
    console.log('selection changed to ', e.text.label);

    document.getElementById('named-roads').remove();
    var newcanvas = document.createElement('canvas');
    newcanvas.setAttribute('id', 'named-roads');
    document.getElementById('named-container').appendChild(newcanvas);

    populateNamedChart(e.text.label);
  });

  new Awesomplete(typeSelect, {list: types});

  populateNamedChart('Residential');
}


function populateNamedChart(type) {
  var classSources = {
    'Unclassified': 'unclassified',
    'Residential': 'residential'
  };
  var sources_colors = {
    'Unclassified':  '#55aa5b',
    'Residential': '#6ab7aa'
  };
  
  sortable.sort(function (a, b) {
    return b.country.named_percent[type] - a.country.named_percent[type];
  });
  data[type] = window.sortable.map(function (item) {
    return item.country.named_percent[type];
  });
  window.data.labels = sortable.map(function (item) {
    return item.label;
  });

  var datasets = [];
  datasets.push({
    label: type,
    data: window.data[type],
    backgroundColor: sources_colors[type]
  });

  var ctx = document.getElementById("named-roads").getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: datasets
    },
    options: {
      scales: {
        xAxes: [{
          stacked: false,
          ticks: {
            autoSkip: false
          }
        }],
        yAxes: [{
          stacked: false,
          ticks: {
            max: 100
          }
        }]
      }
    }
  });
}

