/* Dandy lead capture for the ad landing pages (/v1, /v2, /v3).
 *
 * The browser sends the form to HubSpot's Forms Submission API. That endpoint is
 * built to be called from a browser: it takes no API key, only the portal ID and
 * form GUID, and those are already public in any HubSpot embed code. So the site
 * has no secret to leak and needs no backend.
 * NEVER put a HubSpot private-app token or API key in this file. Anyone who loads
 * the page can read it.
 *
 * Once HubSpot accepts the lead, the script fires the Meta Pixel `Lead` event
 * (with advanced matching) and the GA4 `generate_lead` event.
 */
(function () {
  'use strict';

  var CONFIG = {
    // Hub ID: the number in app-na2.hubspot.com/settings/<id>/... and under the account
    // name in the profile menu. "na2" is the account's data region.
    hubspotPortalId: '242915431',
    hubspotRegion: 'na2',
    // HubSpot → Marketing → Forms → (form) → Share → Embed code → `formId`.
    // Leave the per-page entries empty to use `default` everywhere. The page
    // URL and name go with every submission, so HubSpot can still tell
    // v1, v2 and v3 apart when they share one form.
    // The form must have these contact properties as fields: First name (firstname),
    // Last name (lastname), Email (email), Phone number (phone) and Message (message).
    // Keep only Email required. HubSpot rejects the whole submission if a field it
    // receives is not on the form. When that happens the script resends without
    // that field, but the value is lost.
    hubspotFormGuid: { default: '951087de-5bac-40ba-ae22-d4fb5bd07ab5', v1: '', v2: '', v3: '' },
    // HubSpot property name for the free-text field (v2 sends the to-do list here).
    messageField: 'message',
    // Already initialised in each page's <head>. Set here too for advanced matching.
    metaPixelId: '1101244721912216',
    // Load HubSpot's tracking code. It sets the `hubspotutk` cookie, which ties the
    // submission to the visit, so HubSpot can attribute the contact's source. Source
    // detection relies on UTM tags on the ad URLs (utm_source=facebook&utm_medium=paid_social).
    // If an ad blocker or the in-app browser blocks the cookie, HubSpot still keeps the
    // page URL with its UTMs, but source attribution is lost.
    loadHubspotTracking: true,
    timeoutMs: 10000
  };

  var LOADED_AT = Date.now();
  var HONEYPOT = 'dl_hp_x7';  // A meaningless name, so browser autofill never fills it.
  var SUBMIT_URL = 'https://api.hsforms.com/submissions/v3/integration/submit/';

  function formGuid(page) {
    return CONFIG.hubspotFormGuid[page] || CONFIG.hubspotFormGuid.default;
  }

  function cookie(name) {
    var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : '';
  }

  function splitName(full) {
    var parts = full.trim().split(/\s+/);
    return { first: parts.shift() || '', last: parts.join(' ') };
  }

  function e164(phone) {
    var d = phone.replace(/\D/g, '');
    return d.length === 10 ? '1' + d : d;
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  /* Bot check. The honeypot field is hidden from people, and a person can't
     fill out the form in under 2 seconds. It stops casual spam but not a
     determined attacker. Nothing in the browser can, so leave HubSpot's
     spam filtering on as well. */
  function looksLikeBot(form) {
    var hp = form.querySelector('input[name="' + HONEYPOT + '"]');
    return (hp && hp.value) || Date.now() - LOADED_AT < 2000;
  }

  function addHoneypot(form) {
    if (form.querySelector('input[name="' + HONEYPOT + '"]')) return;
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
    wrap.innerHTML = '<label>Leave this empty<input type="text" name="' + HONEYPOT + '" tabindex="-1" autocomplete="off"></label>';
    form.appendChild(wrap);
  }

  function trackConversion(lead, eventId, extra) {
    try {
      var n = splitName(lead.name);
      // Manual advanced matching. The pixel normalises and SHA-256 hashes these
      // values in the browser before it sends anything to Meta.
      var userData = { em: lead.email.toLowerCase(), ph: e164(lead.phone), fn: n.first.toLowerCase() };
      if (n.last) userData.ln = n.last.toLowerCase();
      fbq('init', CONFIG.metaPixelId, userData);
      // eventID lets Meta dedupe this event if a server-side Conversions API is added later.
      fbq('track', 'Lead', Object.assign({ content_name: lead.page }, extra), { eventID: eventId });
    } catch (x) {}
    try { gtag('event', 'generate_lead', Object.assign({ page: lead.page }, extra)); } catch (x) {}
  }

  function friendlyError(body) {
    var errs = (body && body.errors) || [];
    for (var i = 0; i < errs.length; i++) {
      var t = errs[i].errorType || '';
      if (t === 'INVALID_EMAIL' || t === 'BLOCKED_EMAIL') return 'That email doesn’t look right — mind checking it?';
      if ((t === 'NUMBER_OUT_OF_RANGE' || t === 'INVALID_NUMBER') && /fields\.phone/.test(errs[i].message || '')) return 'That phone number doesn’t look right — mind checking it?';
    }
    return 'Hmm, that didn’t go through. Mind trying again?';
  }

  /* Send a validated lead to HubSpot. If HubSpot accepts it, fire the pixel.
     lead:  { page, name, email, phone, message? }
     extra: additional properties for the Lead / generate_lead events.
     Resolves to { ok: true } or { ok: false, error: '<message for the user>' }. */
  function submit(form, lead, extra) {
    var eventId = uuid();
    extra = extra || {};

    if (looksLikeBot(form)) return Promise.resolve({ ok: true });

    var guid = formGuid(lead.page);
    if (!CONFIG.hubspotPortalId || !guid) {
      // Never report a conversion for a lead that went nowhere. Only on a local dev
      // server do we let the success screen show, so the page can still be clicked through.
      console.error('HubSpot is not configured for ' + lead.page + ' (set hubspotPortalId / hubspotFormGuid in /js/lead.js). The lead was NOT saved.', lead);
      var dev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
      return Promise.resolve(dev ? { ok: true } : { ok: false, error: 'Hmm, that didn\u2019t go through. Mind trying again?' });
    }

    var n = splitName(lead.name);
    var fields = [
      { objectTypeId: '0-1', name: 'firstname', value: n.first },
      { objectTypeId: '0-1', name: 'email', value: lead.email },
      { objectTypeId: '0-1', name: 'phone', value: lead.phone }
    ];
    if (n.last) fields.push({ objectTypeId: '0-1', name: 'lastname', value: n.last });
    if (lead.message && CONFIG.messageField) {
      fields.push({ objectTypeId: '0-1', name: CONFIG.messageField, value: lead.message });
    }
    var context = { pageUri: location.href, pageName: document.title + ' (/' + lead.page + ')' };
    var hutk = cookie('hubspotutk');
    if (hutk) context.hutk = hutk;

    return post(guid, fields, context, true).then(function (r) {
      if (r.ok) trackConversion(lead, eventId, extra);
      return r;
    });
  }

  function post(guid, fields, context, mayRetry) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, CONFIG.timeoutMs);

    return fetch(SUBMIT_URL + encodeURIComponent(CONFIG.hubspotPortalId) + '/' + encodeURIComponent(guid), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submittedAt: String(Date.now()), fields: fields, context: context }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      if (res.ok) return { ok: true };
      return res.json().catch(function () { return null; }).then(function (body) {
        var errs = (body && body.errors) || [];
        console.error('HubSpot rejected the submission (' + res.status + ')', body);
        try { gtag('event', 'lead_error', { status: res.status, error_type: errs.map(function (e) { return e.errorType; }).join(',') }); } catch (x) {}
        // A field missing from the HubSpot form is a setup mistake, not the
        // visitor's fault. Save the contact without that field instead of losing it.
        var missing = errs.filter(function (e) { return e.errorType === 'FIELD_NOT_IN_FORM_DEFINITION'; })
          .map(function (e) { var m = /fields\.([\w-]+)/.exec(e.message || ''); return m && m[1]; });
        if (mayRetry && missing.length && missing.length === errs.length && missing.indexOf(null) < 0 && missing.indexOf('email') < 0) {
          return post(guid, fields.filter(function (f) { return missing.indexOf(f.name) < 0; }), context, false);
        }
        return { ok: false, error: friendlyError(body) };
      });
    }).catch(function (err) {
      if (timer) clearTimeout(timer);
      console.warn('HubSpot submission failed:', err);
      return { ok: false, error: 'Couldn\u2019t reach us \u2014 check your connection and try again.' };
    });
  }

  function init() {
    var forms = document.querySelectorAll('form[data-dandy-lead]');
    for (var i = 0; i < forms.length; i++) addHoneypot(forms[i]);
    if (CONFIG.loadHubspotTracking && CONFIG.hubspotPortalId) {
      var s = document.createElement('script');
      s.id = 'hs-script-loader';
      s.async = true;
      s.defer = true;
      s.src = 'https://js' + (CONFIG.hubspotRegion ? '-' + CONFIG.hubspotRegion : '') + '.hs-scripts.com/' + encodeURIComponent(CONFIG.hubspotPortalId) + '.js';
      document.head.appendChild(s);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.DandyLead = { submit: submit };
})();
