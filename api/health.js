import { sendJson } from './_lib/http.js';

export default function handler(req, res) {
  sendJson(res, 200, {
    ok: true,
    engines: {
      pageSpeed: 'rankedtag-self-hosted',
      authority: 'rankedtag-authority-v1',
      keywordDensity: 'client + server parity',
      densityUrl: 'server-side fetch + html extract',
    },
  });
}
