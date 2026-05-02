import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
let query = '';
let selectedIndex = -1;
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function getYearData(projects) {
  const yearCounts = {};
  for (const project of projects) {
    if (project.year) {
      yearCounts[project.year] = (yearCounts[project.year] || 0) + 1;
    }
  }
  return Object.entries(yearCounts).map(([year, value]) => ({ label: year, value }));
}

function getFilteredProjects() {
  if (!query) return projects;
  return projects.filter(project =>
    Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase())
  );
}

function applySelection(filteredProjects) {
  renderPieAndLegend(filteredProjects, selectedIndex);
  if (selectedIndex === -1) {
    renderProjects(filteredProjects, projectsContainer, 'h2');
  } else {
    const data = getYearData(filteredProjects);
    const year = data[selectedIndex]?.label;
    if (year) {
      renderProjects(
        filteredProjects.filter(p => String(p.year) === String(year)),
        projectsContainer,
        'h2'
      );
    }
  }
}

function renderPieAndLegend(projectsGiven, selectedIdx = -1) {
  const data = getYearData(projectsGiven);
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
    .attr('class', (d, i) => i === selectedIdx ? 'selected' : '')
    .style('cursor', 'pointer')
    .on('click', function(event, d) {
      selectedIndex = selectedIndex === d.index ? -1 : d.index;
      applySelection(getFilteredProjects());
    });

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();

  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item' + (idx === selectedIndex ? ' selected' : ''))
      .style('cursor', 'pointer')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', function() {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        applySelection(getFilteredProjects());
      });
  });
}

renderProjects(projects, projectsContainer, 'h2');
renderPieAndLegend(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  selectedIndex = -1;
  const filtered = getFilteredProjects();
  renderProjects(filtered, projectsContainer, 'h2');
  renderPieAndLegend(filtered, selectedIndex);
});