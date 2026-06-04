// Catch-all 404 for any route that is neither a pre-rendered/static file nor a
// known function (those win via filesystem match before this rewrite fires).
// Returns a REAL 404 status with a branded, noindex page — fixes the soft-404
// where unmatched URLs used to serve the homepage shell with a 200.
import { renderSiteNotFound } from './_lib/render.js';

export default function handler(req, res) {
  res.status(404);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(renderSiteNotFound());
}
