function percentAboveList()
{
  var margin = {top: 30, right: 30, bottom: 30, left: 60};
  var width = 500 - margin.left - margin.right;
  var height = 270 - margin.top - margin.bottom;

  var svg = d3.select("#percentAboveList")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("http://localhost:8080/Data/PercentAboveList.csv",
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
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          var maxValue = Math.max(d["2018"], d["2019"], d["2020"]);
          return maxValue; 
        })])
        .range([height, 0]);

      var yAxis = svg.append("g")
        .call(d3.axisLeft(y))
      
      yAxis.append("text")
        .attr("fill", "black") 
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("% above list price")
        .raise();

      // Add Path
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d["2018"]) })
        );

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d["2019"]) })
        );

      svg.append("path")
        .datum(data)
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
        .style("opacity", 0);

      var focus2019 = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "orange")
        .attr('r', 5)
        .style("opacity", 0);

      var focus2020 = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "green")
        .attr('r', 5)
        .style("opacity", 0);

      // Text
      var focusText2018 = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

      // Text
      var focusText2019 = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

      // Text
      var focusText2020 = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

      var canvas = svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      var line = svg.append("path")
        .style("stroke", "black")
        .style("stroke-width", "1px");

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

      function makeAnnotation(point, dx, dy, label, title, delay)
      {
        var xLoc = x(point.date);
        var yLoc = y(point["2020"]);

        var annotationWidth = 100;
        var annotationHeight = 60;

        svg.append("circle")
          .attr("stroke", "steelblue")
          .attr("fill", "steelblue")
          .attr("r", 5)
          .attr("cx", xLoc)
          .attr("cy", yLoc)
          .style("opacity", 0)
          .transition().delay(delay).style("opacity",1);

        svg.append("line")
          .attr("x1", xLoc)
          .attr("y1", yLoc)
          .attr("x2", xLoc + dx)
          .attr("y2", yLoc + dy)
          .style("stroke", "grey")
          .style("stroke-width", 1)
          .style("opacity", 0)
          .transition().delay(delay).style("opacity",1);

        svg.append("line")
          .attr("x1", xLoc + dx)
          .attr("y1", yLoc + dy)
          .attr("x2", xLoc + dx + annotationWidth)
          .attr("y2", yLoc + dy)
          .style("stroke", "grey")
          .style("stroke-width", 1)
          .style("opacity", 0)
          .transition().delay(delay).style("opacity",1);

        var yLocRect = dy > 0 ? yLoc + dy : yLoc + dy - annotationHeight; 
        svg.append("text")
          .attr("x", xLoc + dx)
          .attr("y", yLocRect + 10)
          .style("font-weight", "bold")
          .style("fill", "grey")
          .text(title)
          .style("opacity", 0)
          .transition().delay(delay).style("opacity",1);
        
        svg.append("text")
          .attr("x", xLoc + dx)
          .attr("y", yLocRect + 25)
          .attr("textLength", annotationWidth)
          .style("font-weight", "normal")
          .style("font-size", 10)
          .style("fill", "grey")
          .text(label)
          .call(wrap, annotationWidth)
          .style("opacity", 0)
          .transition().delay(delay).style("opacity",1);
      }

      makeAnnotation(
        data[4],
        -25,
        50,
        "Covid scare causes slight dip in market, bringing average home sold price above listing to 26% ",
        "May 2020",
        1000);

      makeAnnotation(
        data[9],
        -25,
        100,
        "Market Competition remains tough, raising average home sold price above listing to record 36%",
        "October 2020",
        2000);
  });
}