import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

function getYearData(projects) {
  const yearCounts = {};
  for (const project of projects) {
    if (project.year) {
      yearCounts[project.year] = (yearCounts[project.year] || 0) + 1;
    }
  }
  return Object.entries(yearCounts).map(([year, value]) => ({
    label: year,
    value: value
  }));
}

let selectedIndex = -1;
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieAndLegend(projects, selectedIndex = -1) {
  const data = getYearData(projects);
  const svg = d3.select('#projects-pie-plot');
  svg.selectAll('*').remove();
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const pie = d3.pie().value(d => d.value);
  const arcData = pie(data);

  svg.selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => colors(i))
    .attr('class', (d, i) => i === selectedIndex ? 'selected' : '')
    .on('click', function(_, i) {
      selectedIndex = selectedIndex === i ? -1 : i;
      updateSelection();
    });

  svg.selectAll('text')
    .data(arcData)
    .enter()
    .append('text')
    .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', '8px')
    .text(d => d.data.label);

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item' + (idx === selectedIndex ? ' selected' : ''))
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', function() {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        updateSelection();
      });
  });

  function updateSelection() {
    // Update pie slice selection
    svg.selectAll('path')
      .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');
    // Update legend selection
    legend.selectAll('li')
      .attr('class', (d, i) => 'legend-item' + (i === selectedIndex ? ' selected' : ''));
    // Filter projects
    if (selectedIndex === -1) {
      renderProjects(projects, projectsContainer, 'h2');
    } else {
      const year = data[selectedIndex].label;
      const filtered = projects.filter(p => p.year == year);
      renderProjects(filtered, projectsContainer, 'h2');
    }
  }
}

renderPieAndLegend(projects);