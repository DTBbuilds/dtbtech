'use strict';
// Vercel static fallback, reached only after an existing file/function misses.
// Crucial: a missing page must use HTTP 404, not a 200 rewrite of the homepage.
module.exports = function notFound(req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.end('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Page not found | DTB Technologies</title><style>body{background:#0f172a;color:#f8fafc;min-height:100vh;display:grid;place-items:center;margin:0;font-family:system-ui,sans-serif}main{padding:2rem;max-width:38rem;text-align:center}h1{font-size:clamp(2rem,7vw,4rem);margin:0 0 1rem}p{line-height:1.6;color:#cbd5e1}a{display:inline-block;margin:.8rem .35rem;padding:.8rem 1.2rem;background:#2563eb;color:white;border-radius:.65rem;text-decoration:none}a:focus-visible{outline:3px solid white;outline-offset:3px}</style></head><body><main><h1>Page not found</h1><p>That DTB page does not exist or may have moved. Try the homepage or contact us if you need help.</p><a href="/">Go to homepage</a><a href="/contact">Contact DTB</a></main></body></html>');
};
