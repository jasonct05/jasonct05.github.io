function medianHousePrice()
{
  var margin = {top: 30, right: 100, bottom: 30, left: 60};
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
        .range([ 0, width]);
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

      function makeAnnotation(date, dx, dy, label, title, delay)
      {
        var xLoc = x(date);
        var yLoc = y(data[bisect(data, date, 1)].price);

        var annotationWidth = 120;
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
        new Date(2013, 4, 1, 0, 0, 0, 0),
        50,
        -50,
        "Boston Marathon bombing incident occured killing 3 people and injuring 17.",
        "April 2013",
        1000);

      makeAnnotation(
        new Date(2014, 1, 1, 0, 0, 0, 0),
        50,
        50,
        "The Affordable Care Act (ACA) expanded healthcare coverage to over 20 million people.",
        "January 2014",
        2000);

      makeAnnotation(
        new Date(2016, 1, 1, 0, 0, 0, 0),
        50,
        -40,
        "West Texas Intermediate (WTI) crude oil reached its lowest point in 13 years of US$26.68 per barrel.",
        "January 2016",
        3000);

      makeAnnotation(
        new Date(2017, 1, 1, 0, 0, 0, 0),
        50,
        50,
        "Donald Trump elelected as the 45th President of the United States.",
        "January 2017",
        4000);

      makeAnnotation(
        new Date(2020, 3, 1, 0, 0, 0, 0),
        -50,
        50,
        "WHO declared Coronavirus a global pandemic.",
        "March 2020",
        5000);
  });
}

function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1,
      x = text.attr("x"),
      y = text.attr("y"),
      dy = 0,
      tspan = text.text(null)
                  .append("tspan")
                  .attr("x", x)
                  .attr("y", y)
                  .attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
      }
    }
  });
}
