let currentScene = 0;
const svg = d3.select("#viz");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Scene data
const sceneDescriptions = [
  "Scene 1: An overview of Taylor Swift’s albums over time.",
  "Scene 2: Acousticness and Energy across albums.",
  "Scene 3: Valence and Danceability throughout the years.",
  "Explore: Interact with the full dataset."
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
    drawAlbumTimeline();
  } else if (index === 1) {
    drawAcousticEnergy();
  } else if (index === 2) {
    drawValenceDanceability();
  } else {
    drawInteractiveExplorer();
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
    .attr("width", 85)
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
    .attr("x", -10)
    .attr("y", 0) // now below popupGroup center
    .text("The Eras Tour");

    popupGroup2.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .attr("x", -3)
    .attr("y", 15) // now below popupGroup center
    .text("(May 2023–");

    popupGroup2.append("text")
    .attr("text-anchor", "right")
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .attr("x", -2)
    .attr("y", 30) // now below popupGroup center
    .text("Dec 2025)");

    // ---- end of eras tour popup 
    
    
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
  
  
  
  

//   function drawAcousticEnergy() {
//     d3.csv("data/swift_data.csv").then(data => {
//       // Parse dates for sorting
//       const parseDate = d3.timeParse("%Y-%m-%d");
//       data.forEach(d => {
//         d.release_date = parseDate(d.release_date);
//         d.acousticness = +d.acousticness;
//         d.energy = +d.energy;
//       });
  
//       // Group by album, compute average acousticness and energy
//       const albumStats = Array.from(
//         d3.group(data, d => d.album),
//         ([album, tracks]) => {
//           return {
//             album: album,
//             release_date: d3.min(tracks, d => d.release_date),
//             acousticness: d3.mean(tracks, d => d.acousticness),
//             energy: d3.mean(tracks, d => d.energy)
//           };
//         }
//       ).sort((a, b) => a.release_date - b.release_date); // Sort chronologically
  
//       // Set up dimensions
//       const margin = { top: 40, right: 30, bottom: 100, left: 60 };
//       const innerWidth = width - margin.left - margin.right;
//       const innerHeight = height - margin.top - margin.bottom;
  
//       const x = d3.scaleBand()
//         .domain(albumStats.map(d => d.album))
//         .range([0, innerWidth])
//         .padding(0.3);
  
//       const y = d3.scaleLinear()
//         .domain([0, 1])
//         .range([innerHeight, 0]);
  
//       const svgGroup = svg.append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);
  
//       // Y Axis
//       svgGroup.append("g")
//         .call(d3.axisLeft(y));
  
//       // X Axis
//       svgGroup.append("g")
//         .attr("transform", `translate(0, ${innerHeight})`)
//         .call(d3.axisBottom(x))
//         .selectAll("text")
//         .attr("transform", "rotate(-45)")
//         .style("text-anchor", "end");
  
//       // Acousticness dots
//       svgGroup.selectAll(".dot.acousticness")
//         .data(albumStats)
//         .enter()
//         .append("circle")
//         .attr("class", "dot acousticness")
//         .attr("cx", d => x(d.album) + x.bandwidth() / 2 - 10)
//         .attr("cy", d => y(d.acousticness))
//         .attr("r", 6)
//         .attr("fill", "#1f77b4");
  
//       // Energy dots
//       svgGroup.selectAll(".dot.energy")
//         .data(albumStats)
//         .enter()
//         .append("circle")
//         .attr("class", "dot energy")
//         .attr("cx", d => x(d.album) + x.bandwidth() / 2 + 10)
//         .attr("cy", d => y(d.energy))
//         .attr("r", 6)
//         .attr("fill", "#ff7f0e");
  
//       // Legend
//       const legend = svgGroup.append("g")
//         .attr("transform", `translate(${innerWidth - 100}, 10)`);
  
//       legend.append("circle")
//         .attr("r", 6)
//         .attr("cy", 0)
//         .attr("fill", "#1f77b4");
  
//       legend.append("text")
//         .text("Acousticness")
//         .attr("x", 12)
//         .attr("y", 4);
  
//       legend.append("circle")
//         .attr("r", 6)
//         .attr("cy", 20)
//         .attr("fill", "#ff7f0e");
  
//       legend.append("text")
//         .text("Energy")
//         .attr("x", 12)
//         .attr("y", 24);
//     });
//   }
  

//   function drawValenceDanceability() {
//     d3.csv("data/swift_data.csv").then(data => {
//       const parseDate = d3.timeParse("%Y-%m-%d");
//       data.forEach(d => {
//         d.release_date = parseDate(d.release_date);
//         d.valence = +d.valence;
//         d.danceability = +d.danceability;
//       });
  
//       // Group by album
//       const albumStats = Array.from(
//         d3.group(data, d => d.album),
//         ([album, tracks]) => ({
//           album,
//           release_date: d3.min(tracks, d => d.release_date),
//           valence: d3.mean(tracks, d => d.valence),
//           danceability: d3.mean(tracks, d => d.danceability)
//         })
//       ).sort((a, b) => a.release_date - b.release_date);
  
//       const margin = { top: 40, right: 30, bottom: 100, left: 60 };
//       const innerWidth = width - margin.left - margin.right;
//       const innerHeight = height - margin.top - margin.bottom;
  
//       const x = d3.scaleBand()
//         .domain(albumStats.map(d => d.album))
//         .range([0, innerWidth])
//         .padding(0.3);
  
//       const y = d3.scaleLinear()
//         .domain([0, 1])
//         .range([innerHeight, 0]);
  
//       const svgGroup = svg.append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);
  
//       svgGroup.append("g")
//         .call(d3.axisLeft(y));
  
//       svgGroup.append("g")
//         .attr("transform", `translate(0, ${innerHeight})`)
//         .call(d3.axisBottom(x))
//         .selectAll("text")
//         .attr("transform", "rotate(-45)")
//         .style("text-anchor", "end");
  
//       // Valence
//       svgGroup.selectAll(".valence-dot")
//         .data(albumStats)
//         .enter()
//         .append("circle")
//         .attr("class", "valence-dot")
//         .attr("cx", d => x(d.album) + x.bandwidth() / 2 - 10)
//         .attr("cy", d => y(d.valence))
//         .attr("r", 6)
//         .attr("fill", "#7fc97f");
  
//       // Danceability
//       svgGroup.selectAll(".dance-dot")
//         .data(albumStats)
//         .enter()
//         .append("circle")
//         .attr("class", "dance-dot")
//         .attr("cx", d => x(d.album) + x.bandwidth() / 2 + 10)
//         .attr("cy", d => y(d.danceability))
//         .attr("r", 6)
//         .attr("fill", "#beaed4");
  
//       // Legend
//       const legend = svgGroup.append("g")
//         .attr("transform", `translate(${innerWidth - 100}, 10)`);
  
//       legend.append("circle").attr("r", 6).attr("cy", 0).attr("fill", "#7fc97f");
//       legend.append("text").text("Valence").attr("x", 12).attr("y", 4);
  
//       legend.append("circle").attr("r", 6).attr("cy", 20).attr("fill", "#beaed4");
//       legend.append("text").text("Danceability").attr("x", 12).attr("y", 24);
//     });
//   }
  
//   function drawInteractiveExplorer() {
//     d3.csv("data/swift_data.csv").then(data => {
//       const parseDate = d3.timeParse("%Y-%m-%d");
//       data.forEach(d => {
//         d.release_date = parseDate(d.release_date);
//         d.energy = +d.energy;
//         d.valence = +d.valence;
//         d.danceability = +d.danceability;
//         d.acousticness = +d.acousticness;
//         d.popularity = +d.popularity;
//       });
  
//       const margin = { top: 40, right: 30, bottom: 60, left: 60 };
//       const innerWidth = width - margin.left - margin.right;
//       const innerHeight = height - margin.top - margin.bottom;
  
//       const svgGroup = svg.append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);
  
//       const x = d3.scaleLinear()
//         .domain([0, 1])
//         .range([0, innerWidth]);
  
//       const y = d3.scaleLinear()
//         .domain([0, 1])
//         .range([innerHeight, 0]);
  
//       // Axes
//       svgGroup.append("g")
//         .attr("transform", `translate(0, ${innerHeight})`)
//         .call(d3.axisBottom(x));
  
//       svgGroup.append("g")
//         .call(d3.axisLeft(y));
  
//       // Axis Labels
//       svgGroup.append("text")
//         .attr("x", innerWidth / 2)
//         .attr("y", innerHeight + 40)
//         .attr("text-anchor", "middle")
//         .text("Energy");
  
//       svgGroup.append("text")
//         .attr("x", -innerHeight / 2)
//         .attr("y", -40)
//         .attr("transform", "rotate(-90)")
//         .attr("text-anchor", "middle")
//         .text("Valence");
  
//       // Color scale
//       const color = d3.scaleOrdinal(d3.schemeCategory10);
  
//       // Tooltip
//       const tooltip = d3.select("body").append("div")
//         .attr("class", "tooltip")
//         .style("position", "absolute")
//         .style("padding", "6px")
//         .style("background", "white")
//         .style("border", "1px solid #ccc")
//         .style("pointer-events", "none")
//         .style("opacity", 0);
  
//       // Dots
//       svgGroup.selectAll("circle")
//         .data(data)
//         .enter()
//         .append("circle")
//         .attr("cx", d => x(d.energy))
//         .attr("cy", d => y(d.valence))
//         .attr("r", 5)
//         .attr("fill", d => color(d.album))
//         .attr("opacity", 0.7)
//         .on("mouseover", (event, d) => {
//           tooltip.transition().duration(100).style("opacity", 0.9);
//           tooltip.html(`
//             <strong>${d.name}</strong><br/>
//             Album: ${d.album}<br/>
//             Energy: ${d.energy.toFixed(2)}<br/>
//             Valence: ${d.valence.toFixed(2)}
//           `)
//           .style("left", event.pageX + "px")
//           .style("top", event.pageY - 28 + "px");
//         })
//         .on("mouseout", () => {
//           tooltip.transition().duration(200).style("opacity", 0);
//         });
//     });
//   }
  

  function updateButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
  
    if (currentScene === 0) {
      prevBtn.style.display = "none";
    } else {
      prevBtn.style.display = "inline";
    }
  
    if (currentScene === sceneDescriptions.length - 1) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline";
    }
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

