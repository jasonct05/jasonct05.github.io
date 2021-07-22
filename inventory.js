
var margin = {top: 30, right: 20, bottom: 30, left: 60};
var width = 1000 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var legendMapping = { "lumber": "Price ($) per 110k feet",
                      "steel": "Price ($) per 20 short tons"
                    };

function inventory()
{
  var svg = d3.select("#inventory")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("http://localhost:8080/Data/LumberPrice.csv",
    function(d){
      return { date : d3.timeParse("%B")(d["Month"]), "2018" : parseInt(d["2018"]), "2019" : parseInt(d["2019"]), "2020" : parseInt(d["2020"]) }
    },

    function(data) {
      // Add X axis
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width]);
      
      var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%B")));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          var maxValue = Math.max(d["2018"], d["2019"], d["2020"]);
          return maxValue; 
        })])
        .range([height, 0]);

      var yAxis = svg.append("g")
        .attr("id", "yAxis")
        .call(d3.axisLeft(y))
      
      yAxis.append("text")
        .attr("id", "yLegend")
        .attr("fill", "black") 
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(legendMapping["lumber"])
        .raise();

      // Add Path
      svg.append("path")
        .datum(data)
        .attr("id", "Path2018")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d["2018"]) })
        );

      svg.append("path")
        .datum(data)
        .attr("id", "Path2019")
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d["2019"]) })
        );

      svg.append("path")
        .datum(data)
        .attr("id", "Path2020")
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d["2020"]) })
        );

      // Legend
      svg.append("circle").attr("cx",width - 50).attr("cy", 0).attr("r", 3).style("fill", "steelBlue");
      svg.append("circle").attr("cx",width - 50).attr("cy",10).attr("r", 3).style("fill", "orange");
      svg.append("circle").attr("cx",width - 50).attr("cy",20).attr("r", 3).style("fill", "green");
      svg.append("text").attr("x", width - 40).attr("y", 0).text("2018").style("font-size", "10px").attr("alignment-baseline","middle");
      svg.append("text").attr("x", width - 40).attr("y", 10).text("2019").style("font-size", "10px").attr("alignment-baseline","middle");
      svg.append("text").attr("x", width - 40).attr("y", 20).text("2020").style("font-size", "10px").attr("alignment-baseline","middle");

      // Circles
      var focus2018 = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "steelblue")
        .attr('r', 5)
        .attr("id", "focus2018")
        .style("opacity", 0);

      var focus2019 = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "orange")
        .attr('r', 5)
        .attr("id", "focus2019")
        .style("opacity", 0);

      var focus2020 = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "green")
        .attr("id", "focus2020")
        .attr('r', 5)
        .style("opacity", 0);

      // Text
      var focusText2018 = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("id", "focusText2018")
        .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

      // Text
      var focusText2019 = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("id", "focusText2019")
        .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

      // Text
      var focusText2020 = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("id", "focusText2020")
        .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

      var canvas = svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("id", "canvas")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      var line = svg.append("path")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("id", "line");

      function mouseover() {
        focus2018.style("opacity", 1);
        focus2019.style("opacity", 1);
        focus2020.style("opacity", 1);
        focusText2018.style("opacity", 1);
        focusText2019.style("opacity", 1);
        focusText2020.style("opacity", 1);
        line.style("opacity", 1);
      }

      var bisect = d3.bisector(
        function(d) {
          return d.date;
        }).right;

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);

        // round down to the previous date if date is less than 15
        if (x0.getDate() < 15) {
          x0.setDate(0);
        }

        var i = bisect(data, x0);

        selectedData = data[i];

        var xValue = x(selectedData.date);
        xValue = xValue > 800 ? xValue - 25 : xValue + 15;

        focus2018
          .attr("cx", x(selectedData.date))
          .attr("cy", y(selectedData["2018"]));

        focus2019
          .attr("cx", x(selectedData.date))
          .attr("cy", y(selectedData["2019"]));

        focus2020
          .attr("cx", x(selectedData.date))
          .attr("cy", y(selectedData["2020"]));

        focusText2018
          .html(selectedData["2018"])
          .attr("x", xValue)
          .attr("y", y(selectedData["2018"]));

        focusText2019
          .html(selectedData["2019"])
          .attr("x", xValue)
          .attr("y", y(selectedData["2019"]));

        focusText2020
          .html(selectedData["2020"])
          .attr("x", xValue)
          .attr("y", y(selectedData["2020"]));

        line
          .attr("d", function() {
            var d = "M " + x(selectedData.date) + "," + height;
            d += " L " + x(selectedData.date) + "," + 0;
            return d;
          });
      }

      function mouseout() {
        focus2018.style("opacity", 0);
        focus2019.style("opacity", 0);
        focus2020.style("opacity", 0);
        focusText2018.style("opacity", 0);
        focusText2019.style("opacity", 0);
        focusText2020.style("opacity", 0);
        line.style("opacity", 0);
      }
  });
}

function updateInventory(path)
{
  d3.csv("http://localhost:8080/Data/" + path + "price.csv",
    function(d){
      return { date : d3.timeParse("%B")(d["Month"]), "2018" : parseInt(d["2018"]), "2019" : parseInt(d["2019"]), "2020" : parseInt(d["2020"]) }
    },
    function(data) {

      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width]);

       var y = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) {
            var maxValue = Math.max(d["2018"], d["2019"], d["2020"]);
            return maxValue; 
          })])
          .range([height, 0]);

        d3.select("#yAxis")
          .transition()
          .duration(2000)
          .call(d3.axisLeft(y))

        var path2018 = d3.select("#Path2018")
          .data([data], function(d){ return d.date });

        path2018
          .enter()
          .append("path")
          .attr("id","Path2018")
          .merge(path2018)
          .transition()
          .duration(2000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d["2018"]); }))
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2.5);

        var path2019 = d3.select("#Path2019")
          .data([data], function(d){ return d.date });

        path2019
          .enter()
          .append("path")
          .attr("id","Path2019")
          .merge(path2019)
          .transition()
          .duration(2000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d["2019"]); }));

        var path2020 = d3.select("#Path2020")
          .data([data], function(d){ return d.date });

        path2020
          .enter()
          .append("path")
          .attr("id","Path2020")
          .merge(path2020)
          .transition()
          .duration(2000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d["2020"]); }));

        d3.select("#canvas")
          .on("mousemove", mousemove);

        var bisect = d3.bisector(
        function(d) {
          return d.date;
        }).right;


        d3.select("#yLegend")
          .transition()
          .duration(500)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .text("")
          .transition()
          .duration(500)
          .text(legendMapping[path])
          .style("opacity", 1)

        function mousemove() {
          var x0 = x.invert(d3.mouse(this)[0]);

          // round down to the previous date if date is less than 15
          if (x0.getDate() < 15) {
            x0.setDate(0);
          }

          var i = bisect(data, x0);

          selectedData = data[i];

          var xValue = x(selectedData.date);
          xValue = xValue > 800 ? xValue - 25 : xValue + 15;

          d3.select("#focus2018")
            .attr("cx", x(selectedData.date))
            .attr("cy", y(selectedData["2018"]));

          d3.select("#focus2019")
            .attr("cx", x(selectedData.date))
            .attr("cy", y(selectedData["2019"]));

          d3.select("#focus2020")
            .attr("cx", x(selectedData.date))
            .attr("cy", y(selectedData["2020"]));

          d3.select("#focusText2018")
            .html(selectedData["2018"])
            .attr("x", xValue)
            .attr("y", y(selectedData["2018"]));

          d3.select("#focusText2019")
            .html(selectedData["2019"])
            .attr("x", xValue)
            .attr("y", y(selectedData["2019"]));

          d3.select("#focusText2020")
            .html(selectedData["2020"])
            .attr("x", xValue)
            .attr("y", y(selectedData["2020"]));

          d3.select("#line")
            .attr("d", function() {
              var d = "M " + x(selectedData.date) + "," + height;
              d += " L " + x(selectedData.date) + "," + 0;
              return d;
            });
        }
      }
    );
  }