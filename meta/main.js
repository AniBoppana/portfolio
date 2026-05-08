import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/YOUR_REPO/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        writable: false,
        configurable: false,
      });
      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const container = d3.select('#stats');
  container.html(''); // Clear previous content

  const stats = [
    { label: 'Commits', value: commits.length },
    { label: 'Files', value: d3.groups(data, d => d.file).length },
    { label: 'Total LOC', value: data.length },
    { label: 'Max Depth', value: d3.max(data, d => d.depth) },
    { label: 'Longest Line', value: d3.max(data, d => d.length) },
    { label: 'Max Lines', value: d3.max(data, d => d.line) }
  ];

  const summary = container.append('div').attr('class', 'stats-summary');
  stats.forEach(stat => {
    const statDiv = summary.append('div').attr('class', 'stat');
    statDiv.append('div').attr('class', 'stat-label').text(stat.label.toUpperCase());
    statDiv.append('div').attr('class', 'stat-value').text(stat.value);
  });
}

let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);