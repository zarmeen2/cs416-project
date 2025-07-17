d3.csv("data.csv").then(function(data) {
    // Convert numeric columns from strings to numbers
    data.forEach(d => {
      d.danceability = +d.danceability;
      d.energy = +d.energy;
    //   d.key = +d.key;
    //   d.loudness = +d.loudness;
    //   d.duration_ms = +d.duration_ms;
    //   d.speechiness = +d.speechiness;
    //   d.acousticness = +d.acousticness;
    //   d.instrumentalness = +d.instrumentalness;
    //   d.liveness = +d.liveness;
    //   d.valence = +d.valennce;
    //   d.tempo = +d.tempo;
    });
  
    console.log(data); // Check your parsed data
  
    // Now you can pass data to visualization functions
    drawHistogram(data);
  });
  
  function drawHistogram(data, svgId, xLabel) {
    const values = data.map(d => d[xLabel.toLowerCase()]);
  
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove(); // clear previous content if any
  
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
  
    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(20));
  
    const bins = histogram(values);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
  
    g.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x0) + 1)
      .attr("y", d => y(d.length))
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", d => innerHeight - y(d.length))
      .attr("fill", "steelblue");
  
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(xLabel);
  
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Count");
  }