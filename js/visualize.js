document.getElementById("file").addEventListener("dbloaded", function(e) {
	var db = e.detail;
	
	var chart = document.getElementById("chart");
	
	/*
	var res = db.exec("SELECT COUNT(*) FROM stats");
	
	chart.innerHTML = "Entries loaded:" + res[0].values;
	*/
	
	// LAST 24 HOURS
	var result = db.exec('SELECT strftime("%H", at) AS hour, MAX(passed) AS passed, MAX(failed) AS failed, MAX(pending) AS pending, (passed + failed + pending) AS total FROM stats GROUP BY hour ORDER BY at');
	// LAST DAYS
	// TODO
	
	var labels = [], passed = [], failed = [], pending = [];
	for (var i in result[0]["values"]) {
		var item = result[0]["values"][i];
		
		labels.push(item[0]);
		passed.push(item[1]);
		failed.push(item[2]);
		pending.push(item[3]);
		
		// var total = item[4];
	}
	
	var dataPassed = {
		labels: labels,
		datasets: [
			{
				label: "Passed",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "#0f0",
				data: passed
			}
		]
	};
	
	var dataFailed = {
		labels: labels,
		datasets: [
			{
				label: "Failed",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "#f00",
				data: failed
			}
		]
	};
	
	var dataPending = {
		labels: labels,
		datasets: [
			{
				label: "Pending",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				data: pending
			}
		]
	};
	
	var charts = {"passed": dataPassed, "failed": dataFailed, "pending": dataPending};
	for (var id in charts) {
		var canvas = document.getElementById("chart-" + id);
		
		var legendNode = document.createElement("h2");
		legendNode.innerHTML = id;

		canvas.parentNode.appendChild(legendNode);
		
		var ctx = canvas.getContext("2d");
		var chart = new Chart(ctx).Line(charts[id], {
			responsive: false,
			legendTemplate : '<ul>'
					  +'<% for (var i=0; i<datasets.length; i++) { %>'
						+'<li>'
						+'<span style=\"display:inline-block;width:16px;color:transparent;background-color:<%=datasets[i].strokeColor%>\">A</span> '
						+'<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>'
					  +'</li>'
					+'<% } %>'
				  +'</ul>',
			bezierCurve : true,
			paintDot: false,
			animation: false
		});
	}
});