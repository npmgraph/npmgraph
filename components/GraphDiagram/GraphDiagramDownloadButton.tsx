import React from 'react';
import { report } from '../../lib/bugsnag.js';
import $ from '../../lib/dom.js';

type DownloadExtension = 'svg' | 'png';

export default function GraphDiagramDownloadButton() {
  return (
    <button
      onClick={() => download('svg')}
      title="download as SVG"
      className="material-icons"
      style={{ marginLeft: '0.5em' }}
    >
      cloud_download
    </button>
  );
}

function download(type: DownloadExtension) {
  switch (type) {
    case 'svg':
      downloadSvg();
      break;
    case 'png':
      downloadPng();
      break;
  }
}

function downloadPng() {
  const svg = $<SVGSVGElement>('#graph svg')[0];
  const data = svg.outerHTML;
  const vb = svg.getAttribute('viewBox')?.split(' ');

  if (!vb) {
    report.error(Error('No viewBox'));
    return;
  }

  const canvas = $.create<HTMLCanvasElement>('canvas');
  canvas.width = parseInt(vb[2]);
  canvas.height = parseInt(vb[3]);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const DOMURL = window.URL || window.webkitURL;
  const img = new Image();
  const svgBlob = new Blob([data], { type: 'image/svg+xml' });
  const url = DOMURL.createObjectURL(svgBlob);

  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
    const pngImg = canvas.toDataURL('image/png');
    generateLinkToDownload('png', pngImg);
  };
  img.src = url;
}

function downloadSvg() {
  alert(
    'Note: SVG downloads use the "Roboto Condensed" font, available at https://fonts.google.com/specimen/Roboto+Condensed.',
  );

  const svgData = $<SVGSVGElement>('#graph svg')[0].outerHTML;
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

function generateLinkToDownload(extension: DownloadExtension, link: string) {
  const name = $('title').innerText.replace(/.*- /, '').replace(/\W+/g, '_');
  const downloadLink = $.create<HTMLAnchorElement>('a');
  downloadLink.href = link;
  downloadLink.download = `${name}_dependencies.${extension}`;
  downloadLink.click();
}
