import copy from 'copy-text-to-clipboard';
import { $$, $optional } from 'select-dom';
import CopyIcon from '../../images/icons/copy.svg?react';
import CopyImageIcon from '../../images/icons/copy-image.svg?react';
import DownloadIcon from '../../images/icons/download.svg?react';
import { report } from '../../lib/bugsnag.ts';
import { flash } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeDOT } from '../../lib/graph-util.ts';
import { Button, ButtonBadge, ButtonGroup } from '../Button.tsx';
import * as graphStyles from './GraphDiagram.module.scss';

type DownloadExtension = 'svg' | 'png';

function getDiagramElement() {
  return $optional<SVGSVGElement>(`.${graphStyles.graphDiagram}`);
}

export default function GraphDiagramExportButtons() {
  const [graph] = useGlobalState('graph');

  return (
    <ButtonGroup>
      <Button title="Download graph as SVG" onClick={downloadSvg}>
        <DownloadIcon />
        <ButtonBadge>SVG</ButtonBadge>
      </Button>
      <Button
        title="Copy graph as PNG"
        onClick={() => {
          void copyPng();
        }}
      >
        <CopyImageIcon />
        <ButtonBadge>PNG</ButtonBadge>
      </Button>
      <Button
        title="Copy graph as DOT"
        onClick={() => {
          if (copy(composeDOT({ graph }))) {
            flash('Copied graph as text');
          } else {
            flash('Could not copy graph', 'error');
          }
        }}
      >
        <CopyIcon />
        <ButtonBadge>DOT</ButtonBadge>
      </Button>
    </ButtonGroup>
  );
}

const MAX_PNG_PIXELS = 8_000_000;
const PNG_SCALE = 2;

async function renderPngBlob(): Promise<{
  blob: Blob;
  capped: boolean;
} | null> {
  const svg = getDiagramElement()?.cloneNode(true) as SVGSVGElement | undefined;
  const vb = svg?.getAttribute('viewBox')?.split(' ');

  if (!svg || !vb) {
    report.error(new Error('No viewBox'));
    return null;
  }

  const styleElement = cloneStyleElement();
  if (styleElement) {
    svg.append(styleElement);
  }

  const width = Number(vb[2]);
  const height = Number(vb[3]);
  // Safari can fail to rasterize SVGs lacking explicit pixel dimensions
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  const maxScale = Math.sqrt(MAX_PNG_PIXELS / (width * height));
  const isCapped = PNG_SCALE > maxScale;
  const scale = isCapped ? maxScale : PNG_SCALE;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width * scale));
  canvas.height = Math.max(1, Math.floor(height * scale));
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: 'image/svg+xml;charset=utf-8',
  });
  // eslint-disable-next-line react-doctor/no-create-object-url-without-revoke -- Revoked in the `finally` block below
  const url = URL.createObjectURL(svgBlob);

  try {
    await new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
      img.src = url;
    });

    if (img.naturalWidth === 0) {
      return null;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    return blob ? { blob, capped: isCapped } : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function copyPng() {
  let isCapped = false;
  try {
    // write() (below) needs to be called synchronously so Safari still sees the
    // click's user activation.  Hence, we don't await here but, rather, pass a
    // promise to ClipboardItem, below
    const blobPromise = renderPngBlob().then(result => {
      if (!result) {
        throw new Error('Failed to render PNG');
      }

      isCapped = result.capped;
      return result.blob;
    });
    // Surface render failures; browsers otherwise report them as a generic NotAllowedError
    blobPromise.catch((error: unknown) => {
      console.error('PNG render failed', error);
    });
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blobPromise }),
    ]);
    flash(
      isCapped
        ? 'Graph image copied to clipboard (scaled down to 8 megapixels)'
        : 'Graph image copied to clipboard',
    );
  } catch (error) {
    report.error(error instanceof Error ? error : new Error(String(error)));
    flash('Unable to copy image to clipboard');
  }
}

function downloadSvg() {
  // Get svg DOM (cloned, so we can tweak as needed for SVG export)
  const svg = getDiagramElement()?.cloneNode(true) as SVGSVGElement | undefined;
  if (!svg) {
    return;
  }

  // Add link(s) to font files
  for (const link of $$('link[rel="stylesheet"]')) {
    if (!link.href.includes('fonts.googleapis.com')) {
      continue;
    }

    const fontElement = document.createElement('defs');
    fontElement.innerHTML = `<defs><style type="text/css">@import url('${link.href}');</style></defs>`;
    svg.insertBefore(fontElement, svg.firstChild);
  }

  // Inline the app's styles for export
  const styleElement = cloneStyleElement();
  if (styleElement) {
    svg.append(styleElement);
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

// Collects rules from all readable stylesheets (<link> in production, <style>
// in dev) so CSS variables like --bg-red survive outside the document
function cloneStyleElement() {
  const cssTexts: string[] = [];

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Still works
        if (rule.type !== CSSRule.MEDIA_RULE) {
          cssTexts.push(rule.cssText);
        }
      }
    } catch {
      // Cross-origin sheets (e.g. Google Fonts) can't be read
    }
  }

  if (cssTexts.length === 0) {
    return null;
  }

  const styleElement = document.createElement('style');
  styleElement.textContent = cssTexts.join('\n');
  return styleElement;
}

function generateLinkToDownload(extension: DownloadExtension, link: string) {
  const name = document.title.replace(/.*- /v, '').replaceAll(/\W+/gv, '_');
  const downloadLink = document.createElement('a');
  downloadLink.href = link;
  downloadLink.download = `${name}_dependencies.${extension}`;
  downloadLink.click();
  if (link.startsWith('blob:')) {
    setTimeout(() => {
      URL.revokeObjectURL(link);
    }, 1000);
  }
}
