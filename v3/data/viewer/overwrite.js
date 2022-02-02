/* globals PDFViewerApplication, PDFViewerApplicationOptions */
'use strict';

// e.g. AcroForm
// https://campustecnologicoalgeciras.es/wp-content/uploads/2017/07/OoPdfFormExample.pdf#page=1
// https://kbdeveloper.qoppa.com/wp-content/uploads/blank_signed.pdf#page=1
// e.g. page number
// http://www.africau.edu/images/default/sample.pdf#page=2
// e.g. embedded PDF
// https://www.w3docs.com/tools/code-editor/1087
// e.g. automatic printing
// https://github.com/Emano-Waldeck/pdf-reader/files/5836703/Module.3.-.PPT.pdf
// scripting
// https://www.pdfscripting.com/public/FreeStuff/PDFSamples/PDFS_CopyPastListEntries.pdf#page=1
// https://www.pdfscripting.com/public/FreeStuff/PDFSamples/SimpleFormCalculations.pdf#page=1
// signature
// https://www.tecxoft.com/samples/sample01.pdf#page=1
// form
// http://foersom.com/net/HowTo/data/OoPdfFormExample.pdf#page=1

const args = new URLSearchParams(location.search);
let title;

// prevent CROS error
delete URL.prototype.origin;

// favicon
try {
  const href = args.get('file').split('#')[0];

  // const set = (src = 'https://www.google.com/s2/favicons?sz=64&domain_url=' + href) => {
  const set = (src = 'chrome://favicon/' + href) => {
    const link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = src;
    document.head.appendChild(link);
  };

  const {hostname, protocol} = new URL(href);

  if (protocol.startsWith('http')) {
    const favicon = protocol + '//' + hostname + '/favicon.ico';
    fetch(favicon).then(r => {
      set(r.ok ? favicon : undefined);
    }).catch(() => {
      set();
    });
  }
}
catch (e) {}

// theme
const style = document.createElement('style');
chrome.storage.local.get({
  theme: 'dark-1',
  styles: ''
}, prefs => {
  document.documentElement.dataset.theme = prefs.theme;
  style.textContent = prefs.styles;
  document.documentElement.appendChild(style);
});
chrome.storage.onChanged.addListener(ps => {
  if (ps.theme) {
    document.documentElement.dataset.theme = ps.theme.newValue;
  }
  if (ps.styles) {
    style.textContent = ps.styles.newValue;
  }
});

// copy link
document.addEventListener('DOMContentLoaded', () => {
  title = document.title;
  const parent = document.getElementById('toolbarViewerRight');
  const button = document.createElement('button');
  button.onclick = () => {
    let href = args.get('file').split('#')[0];
    if (PDFViewerApplication.page) {
      href += '#page=' + PDFViewerApplication.page;
    }
    navigator.clipboard.writeText(href).then(() => {
      document.title = 'Link Copied to the Clipboard!';
      setTimeout(() => {
        document.title = title;
      }, 1000);
    }).catch(e => alert(e.message));
  };
  button.classList.add('toolbarButton', 'copyLink');
  const span = document.createElement('span');
  span.textContent = button.title = 'Copy PDF Link';
  button.appendChild(span);
  const openFile = document.getElementById('openFile');
  if (openFile) {
    parent.insertBefore(button, openFile);
  }
  else {
    parent.appendChild(button);
  }
});

// preferences
document.addEventListener('webviewerloaded', function() {
  const _initializeViewerComponents = PDFViewerApplication._initializeViewerComponents;
  PDFViewerApplication._initializeViewerComponents = async function(...args) {
    const prefs = await new Promise(resolve => chrome.storage.local.get({
      'enableScripting': false,
      'disablePageLabels': false,
      'enablePermissions': false,
      'enablePrintAutoRotate': false,
      'enableWebGL': false,
      'historyUpdateUrl': true,
      'ignoreDestinationZoom': false,
      'pdfBugEnabled': false,
      'renderInteractiveForms': true,
      'useOnlyCssZoom': false,
      'disableAutoFetch': false,
      'disableFontFace': false,
      'disableRange': false,
      'disableStream': false,
      'annotationMode': 2
    }, resolve));

    PDFViewerApplicationOptions.set('annotationMode', prefs.annotationMode);
    PDFViewerApplicationOptions.set('enableScripting', prefs.enableScripting);
    delete prefs['enableScripting'];
    delete prefs['renderInteractiveForms'];

    const r = _initializeViewerComponents.apply(this, args);
    const {pdfViewer} = this;

    for (const [key, value] of Object.entries(prefs)) {
      pdfViewer[key] = value;
    }

    return r;
    // console.log(PDFViewerApplication);
    // console.log(PDFViewerApplicationOptions);
  };
});

// change page number
// document.addEventListener('webviewerloaded', () => {
//   PDFViewerApplicationOptions.set('renderInteractiveForms', true);
//   console.log(11);
//   PDFViewerApplication.initializedPromise.then(() => {
//     PDFViewerApplicationOptions.set('renderInteractiveForms', true);
//     PDFViewerApplication.eventBus.on('pagesloaded', () => {
//       if (href.indexOf('#page=') !== -1) {
//         const page = href.split('#page=')[1].split('&')[0];
//         PDFViewerApplication.page = Number(page);
//       }
//     });
//   });
// });
