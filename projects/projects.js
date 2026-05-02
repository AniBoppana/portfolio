import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

if (projectsContainer && projects) {
  const title = document.querySelector('.projects-title');
  if (title) {
    title.textContent += ` (${projects.length})`;
  }
}

const yearCounts = {};
for (const project of projects) {
  if (project.year) {
    yearCounts[project.year] = (yearCounts[project.year] || 0) + 1;
  }
}
const data = Object.entries(yearCounts).map(([year, value]) => ({
  label: year,
  value: value
}));

const svg = d3.select('#projects-pie-plot');
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const pie = d3.pie().value(d => d.value);
const arcData = pie(data);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

svg.selectAll('path')
  .data(arcData)
  .enter()
  .append('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, i) => colors(i));

svg.selectAll('text')
  .data(arcData)
  .enter()
  .append('text')
  .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline', 'middle')
  .attr('font-size', '8px')
  .text(d => d.data.label);

let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend.append('li')
    .attr('style', `--color:${colors(idx)}`)
    .attr('class', 'legend-item')
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});