'use strict';
// Public config only. Access to rows requires Supabase Auth + database RLS.
module.exports = function inboxConfig(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'GET') {res.setHeader('Allow','GET');return res.status(405).json({error:'method_not_allowed'});}
  const url = process.env.DTB_INBOX_SUPABASE_URL || '';
  const key = process.env.DTB_INBOX_PUBLISHABLE_KEY || '';
  const enabled = process.env.DTB_INBOX_ENABLED === 'true'
    && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)
    && /^sb_publishable_[A-Za-z0-9_-]{8,}$/.test(key);
  if(!enabled) return res.status(200).json({enabled:false});
  return res.status(200).json({enabled:true,url:url.replace(/\/$/,''),publishableKey:key});
};
