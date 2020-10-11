import { html, useState, useContext, useEffect } from '../vendor/preact.js';
import { Pane, Section, Tags, Tag, ExternalLink } from './Inspector.js';
import { ajax, simplur } from './util.js';

function ScoreBar({ title, score, style }) {
  const perc = score ? (score * 100).toFixed(0) + '%' : 'n/a';
  const inner = !score ? html`<span style=${style}>Loading...</span>`
    : score instanceof Error ? html`<span style=${style}>Unavailable</span>`
      : html`<div style=${{ width: perc, textAlign: 'right', backgroundColor: '#abd', ...style }}>${perc}</div>`;

  return html`
      <span style=${{ marginRight: '1em', ...style }}>${title}</span>
      <div style=${{ border: 'solid 1px #ccc', width: '200px' }} >${inner}</div>
  `;
}

export default function ModulePane({ module, ...props }) {
  const pkg = module?.package;

  if (!pkg) return html`<${Pane}>No module selected.  Click a module in the graph to see details.</${Pane}>`;

  const [bundleInfo, setBundleInfo] = useState(null);
  const [npmsInfo, setNpmsInfo] = useState(null);

  useEffect(async() => {
    setBundleInfo(pkg ? null : Error('No package selected'));
    setNpmsInfo(pkg ? null : Error('No package selected'));
    setNpmsInfo(null);

    if (!pkg) return;

    ajax('GET', `https://bundlephobia.com/api/size?package=${pkg.name}@${pkg.version}`)
      .then(setBundleInfo)
      .catch(setBundleInfo);

    ajax('GET', `https://api.npms.io/v2/package/${pkg.name}`)
      .then(search => setNpmsInfo(search.score))
      .catch(setNpmsInfo);
  }, [pkg]);

  return html`
    <${Pane} ...${props}>
      <h2>${module?.key}</h2>

      <p>${pkg?.description}</p>

      <${ExternalLink} href=${module.npmLink}>NPM</${ExternalLink}>
      <${ExternalLink} href=${module.repoLink}>GitHub</${ExternalLink}>
      <${ExternalLink} href=${module.apiLink}>package.json</${ExternalLink}>

      <${Section} title="Dependency Size Analysis (Experimental)">
        ${
          (!bundleInfo) ? html`<span>Loading ...</span>`
          : (bundleInfo instanceof Error) ? html`<span>Unavailable</span>`
          : html`<pre>${JSON.stringify(bundleInfo, null, 2)}</pre>`
        }
      </${Section}>

      <${Section} title=${simplur`${Object.entries(pkg?.maintainers).length} Maintainer[|s]`}>
        <${Tags}>
          ${pkg.maintainers.map(({ name, email }) => html`<${Tag} text=${name} type='maintainer' gravatar=${email} />`)}
        </${Tags}>
      </${Section}>


      <${Section} title="NPMS.io Score">
        <div style=${{ display: 'grid', gridTemplateColumns: 'auto 1fr', marginTop: '1em', rowGap: '1px' }}>
          <${ScoreBar} style=${{ fontWeight: 'bold' }} title="Overall" score=${npmsInfo?.final || npmsInfo} />
          <${ScoreBar} style=${{ fontSize: '.85em' }} title="Quality" score=${npmsInfo?.detail?.quality || npmsInfo} />
          <${ScoreBar} style=${{ fontSize: '.85em' }} title="Popularity" score=${npmsInfo?.detail?.popularity || npmsInfo} />
          <${ScoreBar} style=${{ fontSize: '.85em' }} title="Maintenance" score=${npmsInfo?.detail?.maintenance || npmsInfo} />
        </div>
      </${Section}>
   </${Pane}>`;
}