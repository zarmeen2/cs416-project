let currentScene = 0;
const svg = d3.select("#viz");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Scene data
const sceneDescriptions = [
    "",
    "Timeline of Taylor Swift's Musical Career",
    "Acousticness and Energy Across Albums.",
    "Valence and Danceability Across Albums",
    ""
  ];
  

// A mapping of album names to their image file paths
const albumImages = {
    "Taylor Swift": "img/taylor-swift.jpeg",
    "Fearless": "img/fearless.png",
    "Speak Now": "img/speak-now.png",
    "Red": "img/red.png",
    "1989": "img/1989.png",
    "reputation": "img/reputation.png",
    "Lover": "img/lover.jpg",
    "folklore": "img/folklore.jpg",
    "evermore": "img/evermore.jpg",
    "Fearless (Taylor's Version)": "img/fearless-tv.png", 
    "Red (Taylor's Version)": "img/red-tv.png",
    "Midnights": "img/midnights.png",
    "Speak Now (Taylor's Version)": "img/speak-now-tv.jpg",
    "1989 (Taylor's Version)": "img/1989-tv.jpg",
    "The Tortured Poets Department": "img/tortured-poets-department.jpeg",
  };

function clearScene() {
  svg.selectAll("*").remove();
}

function renderScene(index) {
    clearScene();
    d3.select("#scene-description").text(sceneDescriptions[index]);
  
    if (index === 0) {
      // Home scene: display a simple welcome message in the SVG
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("fill", "#333")
        .text("How has Taylor Swift's music changed over the course of her albums?");
        
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "#666")
        .text("Click Next to start exploring →");
  
    } else if (index === 1) {
      drawAlbumTimeline();
    } else if (index === 2) {
      drawAcousticEnergy();
    } else if (index === 3) {
      drawValenceDanceability();
    } else if (index === 4) {
      // Conclusion scene
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("fill", "#333")
        .text("Conclusion");
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "#666")
        .text("Over the past 15 years, Taylor Swift has maintained high levels of danceability in her music, while keeping low levels of valence.");
        
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "#666")
        .text("However, in recent album releases, she has created albums with equal levels of acousticness and energy.");

        svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 80)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "#666")
        .text("Over the years, her acousticness varied, but her last two new albums it has matched energy levels.");
    }
  }
  

function drawAlbumTimeline() {
    d3.csv("data/swift_data.csv").then(data => {
      const parseDate = d3.timeParse("%Y-%m-%d");
      const albums = Array.from(
        d3.group(data, d => d.album),
        ([album, tracks]) => ({
          album: album,
          release_date: parseDate(tracks[0].release_date)
        })
      );
  
      albums.sort((a, b) => a.release_date - b.release_date);
  
      const margin = { top: 100, right: 20, bottom: 60, left: 30 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // set scale for timeline
      const minDate = d3.timeParse("%Y-%m-%d")("2006-06-01");
      const maxAlbumDate = d3.max(albums, d => d.release_date);
      const maxDate = d3.timeParse("%Y-%m-%d")("2025-07-01");
      const x = d3.scaleTime()
       .domain([minDate, maxAlbumDate > maxDate ? maxAlbumDate : maxDate])
       .range([0, innerWidth]);
  
      const svgGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const centerY = innerHeight / 2;
  
      // Timeline line
      svgGroup.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", centerY)
        .attr("y2", centerY)
        .attr("stroke", "#333")
        .attr("stroke-width", 3);
  
      // Add year ticks (once per year)
      svgGroup.append("g")
        .attr("transform", `translate(0, ${centerY + 20})`)
        .call(
          d3.axisBottom(x)
            .ticks(d3.timeYear.every(1))
            .tickFormat(d3.timeFormat("%Y"))
        );

    // ---- hiatus popup -----
    // Define the date range
    const start = d3.timeParse("%Y-%m-%d")("2016-11-01");
    const end = d3.timeParse("%Y-%m-%d")("2017-11-01");

    // X positions for the shading
    const xStart = x(start);
    const xEnd = x(end);

    // Height of the shaded band
    const bandHeight = 40;

    // Add a shaded rectangle
    svgGroup.append("rect")
    .attr("x", xStart)
    .attr("y", centerY - bandHeight / 2)
    .attr("width", xEnd - xStart)
    .attr("height", bandHeight)
    .attr("fill", "lightblue")
    .attr("opacity", 0.3);

    // Popup group centered above shaded area
    const popupX = (xStart + xEnd) / 2;
    const popupY = centerY - bandHeight - 60; // vertical position above band

    const popupGroup = svgGroup.append("g")
    .attr("transform", `translate(${popupX}, ${popupY})`);

    // Connector line
    svgGroup.append("line")
    .attr("x1", popupX)
    .attr("y1", popupY + 20)  // bottom of popup card
    .attr("x2", popupX)
    .attr("y2", centerY - bandHeight / 2) // top of shaded area
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,2"); // dashed line

    // Dot where line meets shaded region
    svgGroup.append("circle")
    .attr("cx", popupX)
    .attr("cy", centerY - bandHeight / 2)
    .attr("r", 4)
    .attr("fill", "steelblue");

    // Popup background (rounded rectangle)
    popupGroup.append("rect")
    .attr("x", -80)
    .attr("y", -40)
    .attr("width", 160)
    .attr("height", 60)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", "white")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");

    // Popup text
    popupGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .attr("y", -20)
    .text("2016–2017 Hiatus");

    popupGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .attr("fill", "#666")
    .attr("y", -5)
    .text("Taylor completely disappears");

    popupGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .attr("fill", "#666")
    .attr("y", 8)
    .text("from the public eye");

    // ------ end hiatus popup -------

    // ----- eras tour popup ------
    // Define the date range
    const tour_start = d3.timeParse("%Y-%m-%d")("2023-05-13");
    const tour_end = d3.timeParse("%Y-%m-%d")("2024-12-10");

    // X positions for the shading
    const xStart2 = x(tour_start);
    const xEnd2 = x(tour_end);

    // Height of the shaded band
    const bandHeight2 = 40;

    // Add a shaded rectangle
    svgGroup.append("rect")
    .attr("x", xStart2)
    .attr("y", centerY - bandHeight2 / 2)
    .attr("width", xEnd2 - xStart2)
    .attr("height", bandHeight2)
    .attr("fill", "lightblue")
    .attr("opacity", 0.3);

    // Popup group centered BELOW shaded area
    const popupX2 = (xStart2 + xEnd2) / 2 + 10;
    const popupY2 = centerY + bandHeight2 + 60; // vertical position below band

    const popupGroup2 = svgGroup.append("g")
    .attr("transform", `translate(${popupX2}, ${popupY2})`);

    // Connector line goes UP from popup to shaded area
    svgGroup.append("line")
    .attr("x1", popupX2 + 30)
    .attr("y1", popupY2 - 20)  // TOP of popup card
    .attr("x2", popupX2)
    .attr("y2", centerY + bandHeight2 / 2) // bottom of shaded area
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,2");

    // Dot where line meets shaded region
    svgGroup.append("circle")
    .attr("cx", popupX2)
    .attr("cy", centerY + bandHeight2 / 2)
    .attr("r", 4)
    .attr("fill", "steelblue");

    // Popup background (rounded rectangle) stays the same
    popupGroup2.append("rect")
    .attr("x", -14)
    .attr("y", -20) // shifted so the group Y is top of card now
    .attr("width", 87)
    .attr("height", 60)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", "white")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");

    // Popup text
    popupGroup2.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .attr("font-weight", "bold")
    .attr("x", -10)
    .attr("y", 0) // now below popupGroup center
    .text("The Eras Tour");

    popupGroup2.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .attr("x", -3)
    .attr("y", 15) // now below popupGroup center
    .text("May 2023–");

    popupGroup2.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .attr("x", -2)
    .attr("y", 30) // now below popupGroup center
    .text("Dec 2025");

    // ---- end of eras tour popup 

    // --- AMAs 2009 -------
    const date_start2 = d3.timeParse("%Y-%m-%d")("2014-01-01");
    const date_end2= d3.timeParse("%Y-%m-%d")("2014-01-01");

    // X positions for the shading
    const xStart4 = x(date_start2);
    const xEnd4 = x(date_end2);

    // Height of the shaded band
    const bandHeight4 = 40;

    // Add a shaded rectangle
    svgGroup.append("rect")
    .attr("x", xStart4)
    .attr("y", centerY - bandHeight4 / 2)
    .attr("width", xEnd4- xStart4)
    .attr("height", bandHeight4)
    .attr("fill", "lightblue")
    .attr("opacity", 0.3);

    // Popup group centered BELOW shaded area
    const popupX4 = (xStart4 + xEnd4) / 2;
    const popupY4 = centerY + bandHeight4 + 60; // vertical position below band

    const popupGroup4 = svgGroup.append("g")
    .attr("transform", `translate(${popupX4}, ${popupY4})`);

    // Connector line goes UP from popup to shaded area
    svgGroup.append("line")
    .attr("x1", popupX4)  // use popupX3, not popupX + 30
    .attr("y1", popupY4 - 20)  // top of popup card
    .attr("x2", popupX4)
    .attr("y2", centerY + bandHeight4 / 2) // bottom of shaded area
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,2");


    // Dot where line meets shaded region
    svgGroup.append("circle")
    .attr("cx", popupX4)
    .attr("cy", centerY + bandHeight4 / 2)
    .attr("r", 4)
    .attr("fill", "steelblue");

    // Popup background (rounded rectangle) stays the same
    popupGroup4.append("rect")
    .attr("x", -14)
    .attr("y", -20) // shifted so the group Y is top of card now
    .attr("width", 160)
    .attr("height", 50)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", "white")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");

    // Popup text
    popupGroup4.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .attr("x", -2)
    .attr("y", 0) // now below popupGroup center
    .text("Taylor releases her first");

    popupGroup4.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .attr("x", 35)
    .attr("y", 15) // now below popupGroup center
    .text("pop album");

     // ------ ende AMAs popul -------


    // -----1989 first pop album popup ------
    const date_start = d3.timeParse("%Y-%m-%d")("2009-09-13");
    const date_end= d3.timeParse("%Y-%m-%d")("2009-09-13");

    // X positions for the shading
    const xStart3 = x(date_start);
    const xEnd3 = x(date_end);

    // Height of the shaded band
    const bandHeight3 = 40;

    // Add a shaded rectangle
    svgGroup.append("rect")
    .attr("x", xStart3)
    .attr("y", centerY - bandHeight3 / 2)
    .attr("width", xEnd3- xStart3)
    .attr("height", bandHeight3)
    .attr("fill", "lightblue")
    .attr("opacity", 0.3);

    // Popup group centered BELOW shaded area
    const popupX3 = (xStart3 + xEnd3) / 2;
    const popupY3 = centerY + bandHeight3 + 60; // vertical position below band

    const popupGroup3 = svgGroup.append("g")
    .attr("transform", `translate(${popupX3}, ${popupY3})`);

    // Connector line goes UP from popup to shaded area
    svgGroup.append("line")
    .attr("x1", popupX3)  // use popupX3, not popupX + 30
    .attr("y1", popupY3 - 20)  // top of popup card
    .attr("x2", popupX3)
    .attr("y2", centerY + bandHeight3 / 2) // bottom of shaded area
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,2");


    // Dot where line meets shaded region
    svgGroup.append("circle")
    .attr("cx", popupX3)
    .attr("cy", centerY + bandHeight3 / 2)
    .attr("r", 4)
    .attr("fill", "steelblue");

    // Popup background (rounded rectangle) stays the same
    popupGroup3.append("rect")
    .attr("x", -14)
    .attr("y", -20) // shifted so the group Y is top of card now
    .attr("width", 160)
    .attr("height", 60)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", "white")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");

    // Popup text
    popupGroup3.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .attr("x", 30)
    .attr("y", 0) // now below popupGroup center
    .text("2009 AMAs");

    popupGroup3.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .attr("x", -3)
    .attr("y", 15) // now below popupGroup center
    .text("Kanye interrupts her award.");

    popupGroup3.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .attr("x", 28)
    .attr("y", 30) // now below popupGroup center
    .text("Sept 13, 2009");
    
      // Draw vertical lines for each album
        const lengths = [50, 130, 100, 150, 200, 100, 150, 100, 200];

        svgGroup.selectAll("line.marker")
        .data(albums)
        .enter()
        .append("line")
        .attr("class", "marker")
        .attr("x1", d => x(d.release_date))
        .attr("x2", d => x(d.release_date))
        .attr("y1", centerY)
        .attr("y2", (d, i) => {
            const length = lengths[i % lengths.length];
            return i % 2 === 0 ? centerY - length : centerY + length;
        })
        .attr("stroke", "#d48bbd")
        .attr("stroke-width", 2);
  
      // Album labels at the end of lines
      svgGroup.selectAll("text.album-label")
        .data(albums)
        .enter()
        .append("text")
        .attr("class", "album-label")
        .attr("x", d => x(d.release_date))
        .attr("y", (d, i) => {
            const length = lengths[i % lengths.length];
            if (i % 2 === 0) {
                // above centerY, move further up by 20 px
                return centerY - (length + 20);
            } else {
                // below centerY, move further down by 20 px
                return centerY + (length + 20);
            }
        })
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", "#333")
        .each(function(d) {
            const words = d.album.split(" ");
            if (words.length > 2) {
            // Split roughly in half
            const mid = Math.ceil(words.length / 2);
            d3.select(this).append("tspan").attr("x", x(d.release_date)).attr("dy", "0em").text(words.slice(0, mid).join(" "));
            d3.select(this).append("tspan").attr("x", x(d.release_date)).attr("dy", "1.2em").text(words.slice(mid).join(" "));
            } else {
            d3.select(this).append("tspan").attr("x", x(d.release_date)).attr("dy", "0em").text(d.album);
            }
        })
        .on("mouseover", function (event, d) {
            d3.select("#tooltip")
              .style("opacity", 1)
              .html(`
                <strong style="font-size:14px;">${d.album}</strong><br/>
                <span style="color:#ccc;">Released: ${d3.timeFormat("%B %d, %Y")(d.release_date)}</span><br/>
                <img src="${albumImages[d.album]}" alt="${d.album} cover" 
                    style="width:100px;height:auto;margin-top:8px;border-radius:4px;">
              `);
          })
          .on("mousemove", function (event) {
            d3.select("#tooltip")
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 40) + "px");
          })
          .on("mouseout", function () {
            d3.select("#tooltip")
              .style("opacity", 0);
          });;
    });
  }
  

  function drawAcousticEnergy() {
    d3.csv("data/swift_data.csv").then(data => {
      const parseDate = d3.timeParse("%Y-%m-%d");
      data.forEach(d => {
        d.release_date = parseDate(d.release_date);
        d.acousticness = +d.acousticness;
        d.energy = +d.energy;
      });
  
      // Group by album, compute averages
      const albumStats = Array.from(
        d3.group(data, d => d.album),
        ([album, tracks]) => ({
          album: album,
          release_date: d3.min(tracks, d => d.release_date),
          acousticness: d3.mean(tracks, d => d.acousticness),
          energy: d3.mean(tracks, d => d.energy)
        })
      ).sort((a, b) => a.release_date - b.release_date);
  
      const margin = { top: 40, right: 30, bottom: 150, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
  
      const svgGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Scales
      const x0 = d3.scaleBand()
        .domain(albumStats.map(d => d.album))
        .range([0, innerWidth])
        .paddingInner(0.2);
  
      const x1 = d3.scaleBand()
        .domain(["acousticness", "energy"])
        .range([0, x0.bandwidth()])
        .padding(0.05);
  
      const y = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
  
      const color = d3.scaleOrdinal()
        .domain(["acousticness", "energy"])
        .range(["#a6cee3", "#fdbf6f"]);
  
      // Bars
      svgGroup.selectAll("g.album")
        .data(albumStats)
        .enter()
        .append("g")
        .attr("class", "album")
        .attr("transform", d => `translate(${x0(d.album)},0)`)
        .selectAll("rect")
        .data(d => [
          { key: "acousticness", value: d.acousticness },
          { key: "energy", value: d.energy }
        ])
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => innerHeight - y(d.value))
        .attr("fill", d => color(d.key));
  
      // Y Axis
      svgGroup.append("g")
        .call(d3.axisLeft(y));
  
      // X Axis
        const xAxisGroup = svgGroup.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      // X Axis title
      svgGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 70)
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .text("Album");
  
      // --- Popup for early album gap ---
      const firstAlbum = albumStats[0];
      const popupXLeft = Math.max(0, x0(firstAlbum.album) - 100);
      const popupYLeft = 20; // near top of chart
  
      const popupGroupLeft = svgGroup.append("g")
        .attr("transform", `translate(${popupXLeft}, ${popupYLeft})`);
  
      popupGroupLeft.append("rect")
        .attr("x", 50)
        .attr("y", -3)
        .attr("width", 300)
        .attr("height", 40)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "white")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
  
      popupGroupLeft.append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .attr("x", 200)
        .attr("y", 15)
        .text("Her early albums have much higher energy levels");

        popupGroupLeft.append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .attr("x", 200)
        .attr("y", 30)
        .text("than acousticness levels.");
  
      // --- Popup for Midnights & TTPD ---
      const midnights = albumStats.find(d => d.album === "Midnights");
      const torturedPoets = albumStats.find(d => d.album === "The Tortured Poets Department");
  
      if (midnights && torturedPoets) {
        const midX = x0(midnights.album) + x0.bandwidth() / 2;
        const torturedX = x0(torturedPoets.album) + x0.bandwidth() / 2;

        // Use energy bar heights as anchor points for the lines
        const midY = y(midnights.energy);
        const torturedY = y(torturedPoets.energy);

        const popupX = (midX + torturedX) / 2;
        const popupY = 60;
    
        const popupGroup = svgGroup.append("g")
          .attr("transform", `translate(${popupX}, ${popupY})`);
  
        popupGroup.append("rect")
          .attr("x", -125)
          .attr("y", 0)
          .attr("width", 250)
          .attr("height", 55)
          .attr("rx", 8)
          .attr("ry", 8)
          .attr("fill", "white")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
  
        popupGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .attr("y", 15)
          .text("Taylor's 2 recent non-recorded");
        popupGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .attr("y", 30)
          .text("albums have same levels of acousticness");
        popupGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .attr("y", 45)
          .text("and energy");

        // Connector lines
        svgGroup.append("line")
        .attr("x1", popupX)
        .attr("y1", popupY + 55) // bottom center of popup
        .attr("x2", midX)
        .attr("y2", midY)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,2");

        svgGroup.append("line")
        .attr("x1", popupX)
        .attr("y1", popupY + 55)
        .attr("x2", torturedX)
        .attr("y2", torturedY)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,2");

        // Circles at ends of lines
        svgGroup.append("circle")
        .attr("cx", midX)
        .attr("cy", midY)
        .attr("r", 4)
        .attr("fill", "steelblue");

        svgGroup.append("circle")
        .attr("cx", torturedX)
        .attr("cy", torturedY)
        .attr("r", 4)
        .attr("fill", "steelblue");
      }
  
      // Legend
      const legend = svgGroup.append("g")
        .attr("transform", `translate(${innerWidth - 120}, 10)`);
  
      legend.selectAll("rect")
        .data(["acousticness", "energy"])
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d));
  
      legend.selectAll("text")
        .data(["acousticness", "energy"])
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 10)
        .text(d => d)
        .attr("font-size", "12px")
        .attr("fill", "#333");
    });
  }
  

  function drawValenceDanceability() {
    d3.csv("data/swift_data.csv").then(data => {
      const parseDate = d3.timeParse("%Y-%m-%d");
      data.forEach(d => {
        d.release_date = parseDate(d.release_date);
        d.valence = +d.valence;
        d.danceability = +d.danceability;
      });
  
      const albumStats = Array.from(
        d3.group(data, d => d.album),
        ([album, tracks]) => ({
          album,
          release_date: d3.min(tracks, d => d.release_date),
          valence: d3.mean(tracks, d => d.valence),
          danceability: d3.mean(tracks, d => d.danceability)
        })
      ).sort((a, b) => a.release_date - b.release_date);
  
      const margin = { top: 40, right: 30, bottom: 150, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
  
      const svgGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const x0 = d3.scaleBand()
        .domain(albumStats.map(d => d.album))
        .range([0, innerWidth])
        .paddingInner(0.2);
  
      const x1 = d3.scaleBand()
        .domain(["valence", "danceability"])
        .range([0, x0.bandwidth()])
        .padding(0.05);
  
      const y = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
  
      const color = d3.scaleOrdinal()
        .domain(["valence", "danceability"])
        .range(["#a6dba0", "#c7b9e2"]); // pastel colors
  
      svgGroup.selectAll("g.album")
        .data(albumStats)
        .enter()
        .append("g")
        .attr("class", "album")
        .attr("transform", d => `translate(${x0(d.album)},0)`)
        .selectAll("rect")
        .data(d => [
          { key: "valence", value: d.valence },
          { key: "danceability", value: d.danceability }
        ])
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => innerHeight - y(d.value))
        .attr("fill", d => color(d.key));
  
      svgGroup.append("g").call(d3.axisLeft(y));
      svgGroup.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
  
      svgGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 70)
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .text("Album");
  
      const legend = svgGroup.append("g")
        .attr("transform", `translate(${innerWidth - 120}, 10)`);
  
      const legendData = ["valence", "danceability"];
      legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d));
  
      legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 10)
        .text(d => d)
        .attr("font-size", "12px")
        .attr("fill", "#333");
  
      // --- Annotation: Danceability > Valence ---
    const popupX = innerWidth / 2;
    const popupY = 30;

    const popupGroup = svgGroup.append("g")
    .attr("transform", `translate(${popupX}, ${popupY})`);

    popupGroup.append("rect")
    .attr("x", -120)
    .attr("y", -20)
    .attr("width", 240)
    .attr("height", 40)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", "white")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");

    popupGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .attr("y", -2)
    .text("Across all albums, danceability");
    popupGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .attr("y", 12)
    .text("is consistently higher than valence");

    });
  }
  
  



function updateButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    // Disable or enable based on the scene
    prevBtn.disabled = (currentScene === 0);
    nextBtn.disabled = (currentScene === sceneDescriptions.length - 1);
}

d3.select("#nextBtn").on("click", () => {
    if (currentScene < sceneDescriptions.length - 1) {
        currentScene++;
        renderScene(currentScene);
        updateButtons();
    }
});

d3.select("#prevBtn").on("click", () => {
    if (currentScene > 0) {
        currentScene--;
        renderScene(currentScene);
        updateButtons();
    }
});

d3.csv("data/swift_data.csv").then(data => {
    console.log("Data loaded:", data);
    renderScene(currentScene);
    updateButtons();
});
