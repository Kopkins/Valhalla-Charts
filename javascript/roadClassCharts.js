/*
 * prep the data for populating the road data charts
 */
function prepRoadDataForCharts() {
  window.data = {labels: []};
  window.sortable = [];
  var countries = getAllRoadData();
  Object.keys(countries).forEach(function (iso3) {
    var country = countries[iso3];
    sortable.push({label: country.name, country: country});
  });

  sortable.sort(function (a, b) {
    return (a.country.classinfo.total < b.country.classinfo.total) ? 1 : -1;
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

function populateMaxSpeedChart() {
	var sources = ['Motorway', 'Primary', 'Secondary', 'Trunk'];
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
	window.data.labels = sortable.map(function (item) {
		return item.label;
	});
	
	sources.forEach(function (source) {
    data[source] = window.sortable.map(function (item) {
      return item.country.maxspeed[source] / item.country.classinfo[classSources[source]] * 25;
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
    }
  });
}
