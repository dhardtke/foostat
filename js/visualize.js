// global variable
var db = null;

window.onload = function() {
    var queries = {
        TOTAL: "SELECT strftime('%H', at) AS hour, MAX(passed) AS passed, MAX(failed) AS failed, MAX(pending) AS pending, (passed + failed + pending) AS total FROM stats GROUP BY hour ORDER BY at",
        LAST24: "SELECT strftime('%H', at) AS hour, MAX(passed) AS passed, MAX(failed) AS failed, MAX(pending) AS pending, (passed + failed + pending) AS total FROM stats WHERE at > datetime('now','-1 day') GROUP BY hour ORDER BY at",
        LASTWEEK: "SELECT strftime('%H', at) AS hour, MAX(passed) AS passed, MAX(failed) AS failed, MAX(pending) AS pending, (passed + failed + pending) AS total FROM stats WHERE at > datetime('now','-7 days') GROUP BY hour ORDER BY at"
    };

    var tabs = document.getElementsByClassName("tab");

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", function (e) {
            if (db == null) {
                alert("You have to load a database first!");
            } else {
                // remove active
                document.getElementsByClassName("tab active")[0].className = "tab";
                // add active to clicked tab
                this.className = "tab active";

                updateCharts();
            }
        });
    }

    var chart = document.getElementById("chart");

    document.getElementById("file").addEventListener("dbloaded", function (e) {
        db = e.detail;

        updateCharts();
    });

    function updateCharts() {
        // find active tab to determine which query to run
        var tab = document.getElementsByClassName("tab active")[0];
        var query = queries[tab.getAttribute("data-what").toUpperCase()];

        var result = db.exec(query);

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

            // remove a possibly existing legend
            var existingLegend = canvas.parentNode.getElementsByTagName("h2");
            if (existingLegend.length == 1) {
                canvas.parentNode.removeChild(existingLegend[0]);
            }
            canvas.parentNode.appendChild(legendNode);

            // if there is a chart already, destroy it
            if (typeof canvas.chart != "undefined") {
                canvas.chart.destroy();
            }

            var ctx = canvas.getContext("2d");
            var chart = new Chart(ctx).Line(charts[id], {
                responsive: false,
                legendTemplate: '<ul>'
                + '<% for (var i=0; i<datasets.length; i++) { %>'
                + '<li>'
                + '<span style=\"display:inline-block;width:16px;color:transparent;background-color:<%=datasets[i].strokeColor%>\">A</span> '
                + '<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>'
                + '</li>'
                + '<% } %>'
                + '</ul>',
                bezierCurve: true,
                paintDot: false,
                animation: false
            });

            // remember chart instance to be able to destroy it later
            canvas.chart = chart;
        }
    }
};