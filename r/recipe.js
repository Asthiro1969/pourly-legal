/* Pourly 共有 URL /r/<レシピID> のレシピページ（閲覧のみ・ログインなし）。
 * anon（publishable）キーで Supabase を読む。RLS で public / unlisted だけが返る。
 * 非公開・削除済み・存在しない ID はどれも同じ「このレシピは見られません」を出す。
 * APP_STORE_URL が空の間は「iPhone 版を準備中」。入れると「App Store で入手」ボタンになる。 */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://kqtmmfrxwzslkwvseeyp.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_02ZcdeU1mELaRkfiDuvwLg_RGbqwyQ5';
  var APP_STORE_URL = '';

  var L = {
    dripper: { v60: 'V60', kalita_wave: 'カリタ ウェーブ', origami: 'ORIGAMI', melitta: 'メリタ', kono: 'KONO', chemex: 'ケメックス', flat_bottom: 'フラットボトム', switch: 'スイッチ', clever: 'クレバー', french_press: 'フレンチプレス', aeropress: 'エアロプレス', cupping_bowl: 'カッピングボウル', siphon: 'サイフォン', cold_brew_bottle: '水出しボトル', other: 'その他' },
    method: { pour_over: '透過', immersion: '浸漬', hybrid: 'ハイブリッド', cold_brew: 'コールドブリュー' },
    serve: { hot: 'ホット', iced: 'アイス', milk: 'ミルク' },
    grind: { coarse: '粗挽き', medium_coarse: '中粗挽き', medium: '中挽き', medium_fine: '中細挽き', fine: '細挽き' },
    roast: { light: '浅煎り', medium_light: '中浅煎り', medium: '中煎り', medium_dark: '中深煎り', dark: '深煎り' },
    process: { washed: 'ウォッシュド', natural: 'ナチュラル', honey: 'ハニー', anaerobic: 'アナエロビック', other: 'その他' },
    action: { bloom: '蒸らし', pour: '注ぐ', wait: '待つ', swirl: 'ゆする', stir: 'かき混ぜる', break: '表面を崩す', close: '弁を閉じる', release: '弁を開ける', flip: 'ひっくり返す', press: 'プレスする', remove: '器具を外す' },
    pour: { center: '中心に', circle: '円を描く', spiral: '中心から外へ', edge: 'ふちに沿って' },
    flow: { thin: '細く', normal: '普通', thick: '太く' }
  };
  var AXES = [['acidity', '酸味'], ['sweetness', '甘さ'], ['bitterness', '苦味'], ['body', 'ボディ'], ['aftertaste', '余韻'], ['cleanliness', 'クリーンさ']];

  var root = document.getElementById('recipe-root');
  if (!root) return;

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (children) children.forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function label(map, key, fallback) { return (key && map[key]) || fallback || key || ''; }
  function num(n) { if (n == null) return ''; var v = Number(n); return Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10); }
  function mmss(sec) { if (sec == null) return ''; sec = Math.round(sec); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
  function ratio(dose, water) { if (!dose || !water) return ''; var r = water / dose; return '1:' + (Number.isInteger(r) ? r : Math.round(r * 10) / 10); }

  function appButton() {
    if (APP_STORE_URL) return el('p', { class: 'cta' }, [el('a', { class: 'btn', href: APP_STORE_URL, text: 'App Store で入手' })]);
    return el('div', { class: 'card' }, [el('p', { style: 'margin:0', text: 'Pourly の iPhone 版は準備中です。公開までもう少しお待ちください。' })]);
  }

  function renderNotFound() {
    document.title = 'このレシピは見られません | Pourly';
    root.innerHTML = '';
    root.appendChild(el('h1', { text: 'このレシピは見られません' }));
    root.appendChild(el('p', { text: '非公開になったか、削除されたか、URL が正しくない可能性があります。' }));
    root.appendChild(appButton());
    root.appendChild(el('p', {}, [el('a', { href: '/', text: 'Pourly について' })]));
  }

  function renderError() {
    document.title = 'Pourly のレシピ';
    root.innerHTML = '';
    root.appendChild(el('h1', { text: 'レシピを読み込めませんでした' }));
    root.appendChild(el('p', { text: '通信に失敗しました。時間をおいて開き直してください。' }));
    root.appendChild(appButton());
  }

  function radar(sum) {
    var W = 280, H = 220, cx = W / 2, cy = H / 2, R = 78, ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'radar');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', AXES.map(function (a) { return a[1] + ' ' + num(sum['avg_' + a[0]]); }).join('、'));
    function pt(i, v) { var ang = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(ang) * R * v / 5, cy + Math.sin(ang) * R * v / 5]; }
    [1, 2, 3, 4, 5].forEach(function (lv) {
      var poly = document.createElementNS(ns, 'polygon');
      poly.setAttribute('points', AXES.map(function (_, i) { return pt(i, lv).join(','); }).join(' '));
      poly.setAttribute('class', 'grid');
      svg.appendChild(poly);
    });
    AXES.forEach(function (a, i) {
      var p = pt(i, 5), line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy); line.setAttribute('x2', p[0]); line.setAttribute('y2', p[1]);
      line.setAttribute('class', 'grid'); svg.appendChild(line);
      var lp = pt(i, 6.5), t = document.createElementNS(ns, 'text');
      t.setAttribute('x', lp[0]); t.setAttribute('y', lp[1]); t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'middle');
      t.textContent = a[1]; svg.appendChild(t);
    });
    var vals = AXES.map(function (a) { return sum['avg_' + a[0]]; });
    var shape = document.createElementNS(ns, 'polygon');
    shape.setAttribute('points', vals.map(function (v, i) { return pt(i, v == null ? 0 : Number(v)).join(','); }).join(' '));
    shape.setAttribute('class', 'shape');
    svg.appendChild(shape);
    return svg;
  }

  function row(k, v) { return v ? el('div', { class: 'kv' }, [el('dt', { text: k }), el('dd', { text: v })]) : null; }

  function render(r, sum) {
    document.title = r.title + ' | Pourly';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', r.title + ' — Pourly のハンドドリップレシピ');
    root.innerHTML = '';
    var p = r.profiles;

    root.appendChild(el('p', { class: 'eyebrow', text: 'Pourly のレシピ' }));
    root.appendChild(el('h1', { text: r.title }));
    if (p) root.appendChild(el('p', { class: 'author', text: p.display_name + '（@' + p.handle + '）' }));

    var chips = [label(L.method, r.brew_method), r.dripper === 'other' && r.dripper_note ? r.dripper_note : label(L.dripper, r.dripper), label(L.serve, r.serve_style)].filter(Boolean);
    root.appendChild(el('p', { class: 'chips' }, chips.map(function (t) { return el('span', { class: 'chip', text: t }); })));

    var dl = el('dl', { class: 'spec' });
    var dose = Number(r.dose_g), water = Number(r.water_g);
    dl.appendChild(row('豆：湯', num(r.dose_g) + ' g : ' + num(r.water_g) + ' g（' + ratio(dose, water) + '）'));
    if (r.serve_style === 'iced' && r.ice_g) dl.appendChild(row('氷', num(r.ice_g) + ' g（豆:湯+氷 ' + ratio(dose, water + Number(r.ice_g)) + '）'));
    if (r.serve_style === 'milk' && r.milk_ml) dl.appendChild(row('ミルク', num(r.milk_ml) + ' ml'));
    if (r.water_temp_c != null) dl.appendChild(row('湯温', num(r.water_temp_c) + '℃'));
    var grind = label(L.grind, r.grind);
    if (r.grinder_model) grind += '（' + r.grinder_model + (r.grinder_clicks != null ? ' ' + num(r.grinder_clicks) : '') + '）';
    dl.appendChild(row('挽き目', grind));
    if (r.brew_method === 'cold_brew' && r.steep_minutes) dl.appendChild(row('浸漬時間', r.steep_minutes >= 60 ? Math.floor(r.steep_minutes / 60) + ' 時間' + (r.steep_minutes % 60 ? r.steep_minutes % 60 + ' 分' : '') : r.steep_minutes + ' 分'));
    else if (r.total_time_sec) dl.appendChild(row('抽出時間', mmss(r.total_time_sec)));
    var b = r.bean_profiles;
    if (b) {
      var bean = [b.roasters && b.roasters.name, b.name].filter(Boolean).join(' ');
      var sub = [label(L.roast, b.roast), b.origin_country, label(L.process, b.process)].filter(Boolean).join('・');
      dl.appendChild(row('豆', bean + (sub ? '（' + sub + '）' : '')));
    }
    root.appendChild(dl);

    var steps = (r.recipe_steps || []).slice().sort(function (a, b) { return a.position - b.position; });
    if (steps.length) {
      root.appendChild(el('h2', { text: '手順' }));
      var tbl = el('table', { class: 'steps' });
      tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { text: '時間' }), el('th', { text: '累計湯量' }), el('th', { text: '動作' })])]));
      var tb = el('tbody');
      steps.forEach(function (s) {
        var act = label(L.action, s.action);
        var extra = [s.pour_style && label(L.pour, s.pour_style), s.flow_rate && label(L.flow, s.flow_rate)].filter(Boolean).join('・');
        var cell = el('td', {}, [el('span', { text: act })]);
        if (extra) cell.appendChild(el('span', { class: 'sub', text: '　' + extra }));
        if (s.memo) cell.appendChild(el('div', { class: 'memo', text: s.memo }));
        tb.appendChild(el('tr', {}, [el('td', { text: mmss(s.start_sec) }), el('td', { text: s.cumulative_water_g != null ? num(s.cumulative_water_g) + ' g' : '—' }), cell]));
      });
      tbl.appendChild(tb);
      root.appendChild(tbl);
    }

    if (r.note) { root.appendChild(el('h2', { text: 'メモ' })); root.appendChild(el('p', { class: 'note', text: r.note })); }

    if (r.source_type === 'adapted' && r.source_name) {
      var src = el('p', { class: 'source' }, ['参考：', r.source_url ? el('a', { href: r.source_url, rel: 'nofollow noopener', target: '_blank', text: r.source_name }) : r.source_name]);
      root.appendChild(src);
    }

    root.appendChild(el('h2', { text: 'このレシピで淹れた人' }));
    var n = sum ? Number(sum.brewer_count) : Number(r.brew_log_count || 0);
    var stat = el('div', { class: 'card stat' });
    if (n > 0) {
      stat.appendChild(el('p', { class: 'big', text: n + ' 人が淹れました' + (sum && sum.avg_rating != null ? '　平均 ★' + num(sum.avg_rating) : '') }));
      if (sum && sum.avg_acidity != null) { stat.appendChild(radar(sum)); stat.appendChild(el('p', { class: 'sub', text: '味の平均（酸味・甘さ・苦味・ボディ・余韻・クリーンさ、5 段階）' })); }
      else stat.appendChild(el('p', { class: 'sub', text: '味の平均は 3 人以上の記録が集まると表示されます。' }));
    } else {
      stat.appendChild(el('p', { class: 'big', text: 'まだ誰も淹れていません' }));
      stat.appendChild(el('p', { class: 'sub', text: 'Pourly でこのレシピを淹れて記録すると、作者に届きます。' }));
    }
    root.appendChild(stat);

    root.appendChild(el('h2', { text: 'このレシピで淹れる' }));
    root.appendChild(el('p', { text: 'Pourly はハンドドリップのレシピを投稿して、そのレシピで淹れて、味を記録するアプリです。タイマーがこの手順を読み上げます。' }));
    root.appendChild(appButton());
  }

  function fetchJson(path) {
    return fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); });
  }

  var m = /^\/r\/([0-9a-f-]{36})\/?$/i.exec(location.pathname);
  var id = m ? m[1] : (new URLSearchParams(location.search).get('id') || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) { renderNotFound(); return; }
  id = id.toLowerCase();

  var sel = 'id,title,dripper,dripper_note,dose_g,water_g,water_temp_c,grind,grinder_model,grinder_clicks,total_time_sec,note,source_type,source_name,source_url,brew_method,serve_style,ice_g,milk_ml,steep_minutes,brew_log_count,avg_rating,' +
    'profiles!recipes_user_id_fkey(handle,display_name),bean_profiles(name,roast,origin_country,process,roasters(name)),recipe_steps(position,start_sec,cumulative_water_g,action,memo,pour_style,flow_rate)';
  Promise.all([
    fetchJson('recipes?select=' + encodeURIComponent(sel) + '&id=eq.' + id + '&limit=1'),
    fetchJson('recipe_taste_summary?select=*&recipe_id=eq.' + id + '&limit=1').catch(function () { return []; })
  ]).then(function (res) {
    var r = res[0] && res[0][0];
    if (!r) { renderNotFound(); return; }
    render(r, res[1] && res[1][0]);
  }).catch(function (e) { console.warn(e); renderError(); });
})();
