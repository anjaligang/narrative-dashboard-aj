// Load data from the CSV file
d3.csv('Oppenheimer_State_Search.csv').then(data => {

  data = data.slice(1);

  // Convert 'search' values to numbers
  data.forEach(d => {
    d.search = +d.search;
  });

  // Width and height of the map container
  const width = 800;
  const height = 600;

  // Append an SVG element to the map container
  const svg = d3.select('#mapContainer')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Projection for the USA map
  const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);

  // Path generator
  const path = d3.geoPath().projection(projection);

  // Load the USA map TopoJSON data
  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(us => {

    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(us, us.objects.states);


    // Draw the map
    svg.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', d => {

        // console.log(d)
        // Get the corresponding search data for the state/region
        const stateName = d.properties.name;
        // console.log(stateName)
        const searchData = data.find(item => item.region === stateName);
        return searchData ? getColor(searchData.search) : '#ccc';
      })
      .on('mouseover', function (d) {
        // Show tooltip on hover
        const stateName = d.properties.name;
        const searchData = data.find(item => item.region === stateName);
        tooltip.text(`${stateName}: ${searchData ? searchData.search : 'N/A'}`);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function () {
        // Move tooltip with mouse
        tooltip.style('top', (d3.event.pageY - 10) + 'px').style('left', (d3.event.pageX + 10) + 'px');
      })
      .on('mouseout', function () {
        // Hide tooltip on mouseout
        tooltip.style('visibility', 'hidden');
      });
  });

  function getColor(searchValue) {
    // Using a color scale with shades of blue from light to dark (reversed domain)
    const colorScale = d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateBlues);
    return colorScale(searchValue);
  }

  // Tooltip element
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden');
});