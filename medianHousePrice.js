function medianHousePrice()
{
  var margin = {top: 30, right: 20, bottom: 30, left: 50};
  var width = 1000 - margin.left - margin.right;
  var height = 270 - margin.top - margin.bottom;

  var svg = d3.select("#medianHousePrice")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("http://localhost:8080/Data/MedianSalePrice.csv",
    function(d){
      return { date : d3.timeParse("%m/%d/%Y")(d.Date), price : parseInt(d.Price.replace(",","")) }
    },

    function(data) {
      // Add X axis
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.price; })])
        .range([ height, 0 ]);
      var yAxis = svg.append("g")
        .call(d3.axisLeft(y));

      yAxis.append("text")
        .attr("fill", "black") 
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Median Selling Price ($)");

      // Add Path
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d.price) })
          )

      // Circle
      var focus = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "steelblue")
        .attr('r', 5)
        .style("opacity", 0)

      // Text
      var focusText = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

      svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity",1)
      }

      var bisect = d3.bisector(function(d) { return d.date; }).left;

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);

        // round down to the previous date if date is less than 15
        if (x0.getDate() < 15) {
          x0.setDate(0);
        }

        var i = bisect(data, x0, 1);

        selectedData = data[i];
        var focusTextContent = selectedData.date.getFullYear() + "/" + (selectedData.date.getMonth() + 1)+ "/" + selectedData.date.getDate();

        focus
          .attr("cx", x(selectedData.date))
          .attr("cy", y(selectedData.price));

        focusText
          .html("date:" + focusTextContent + ", price:" + selectedData.price)
          .attr("x", 
            function () {
              var startLocation = x(selectedData.date);
              if (startLocation > 750)
              {
                startLocation = startLocation - 140;
              }
              else
              {
                startLocation += 15
              }
              return startLocation;
            })
          .attr("y", y(selectedData.price));
      }

      function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
      }
  });
}