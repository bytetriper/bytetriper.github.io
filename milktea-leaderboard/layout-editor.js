(() => {
  const key = 'milktea-layout-v2';
  const controls = [
    ['entry-pad', '上下留白（各）', 0, 32, 0],
    ['logo-size', '店标大小', 32, 96, 62],
    ['name-gap', '店名与饮品名间距', 0, 20, 0],
    ['name-leading', '店名行高', 14, 30, 14],
    ['drink-size', '饮品名字号', 16, 32, 18],
    ['drink-leading', '饮品名行高', 22, 42, 23],
    ['column-gap', '横向列间距', 4, 40, 40],
    ['photo-order-gap', '照片与糖冰选项额外间距', 0, 100, 52],
    ['station-title-size', '站牌标题字号', 20, 42, 42],
    ['station-circle-size', '圆圈直径', 24, 56, 39],
    ['station-letter-size', '圆圈内字号', 14, 38, 29],
    ['station-row-gap', '标题与圆圈间距', 4, 28, 4],
    ['station-padding', '站牌上下留白', 8, 26, 9]
  ];
  let settings = Object.fromEntries(controls.map(([id,,,,value]) => [id, value]));
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    for (const [id,,min,max] of controls) {
      if (saved && Number.isFinite(saved[id])) settings[id] = Math.min(max, Math.max(min, saved[id]));
    }
  } catch { /* Defaults remain usable when storage is unavailable. */ }
  const panel = document.getElementById('layout-editor');
  const toggle = document.getElementById('edit-layout');
  const status = document.getElementById('editor-status');
  const ranges = {};
  function measure() {
    const row = document.querySelector('.tea-row');
    document.getElementById('row-measure').textContent = row ? `条目实际高度 ${Math.round(row.getBoundingClientRect().height * 10) / 10}px` : '暂无条目';
  }
  function exportText() {
    const row = document.querySelector('.tea-row');
    return JSON.stringify({version: 1, cssVariables: Object.fromEntries(Object.entries(settings).map(([id,v]) => [`--${id}`, `${v}px`])), rowHeightPx: row ? Math.round(row.getBoundingClientRect().height * 10) / 10 : null, viewportWidthPx: window.innerWidth}, null, 2);
  }
  function apply(save = true) {
    for (const [id,value] of Object.entries(settings)) {
      document.documentElement.style.setProperty(`--${id}`, `${value}px`);
      if (ranges[id]) { ranges[id].input.value = value; ranges[id].output.textContent = `${value}px`; }
    }
    if (save) {
      try { localStorage.setItem(key, JSON.stringify(settings)); status.textContent = '已保存到当前浏览器。调好后点「复制参数」发给我。'; }
      catch { status.textContent = '浏览器无法保存，请复制或下载参数以保留调整。'; }
    }
    measure();
    document.getElementById('layout-export').value = exportText();
  }
  for (const [id,title,min,max] of controls) {
    const box = document.createElement('div'); box.className = 'layout-control';
    const label = document.createElement('label'); label.htmlFor = `adjust-${id}`; label.textContent = title;
    const output = document.createElement('output'); output.htmlFor = `adjust-${id}`;
    const input = document.createElement('input'); input.type = 'range'; input.id = `adjust-${id}`; input.min = min; input.max = max; input.step = 1;
    input.addEventListener('input', () => {
      settings[id] = Number(input.value);
      // Keep the title line height at least as large as its font size.
      if (id === 'drink-size' && settings['drink-leading'] < settings[id]) settings['drink-leading'] = settings[id];
      if (id === 'drink-leading' && settings[id] < settings['drink-size']) settings[id] = settings['drink-size'];
      if (id === 'station-circle-size') settings['station-letter-size'] = Math.min(settings['station-letter-size'], settings[id] - 6);
      if (id === 'station-letter-size') settings[id] = Math.min(settings[id], settings['station-circle-size'] - 6);
      apply();
    });
    label.append(output); box.append(label, input); document.getElementById(id.startsWith('station-') ? 'station-controls' : 'layout-controls').append(box); ranges[id] = {input, output};
  }
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    toggle.textContent = panel.hidden ? '调整布局' : '收起调节';
    document.body.classList.toggle('layout-editing', !panel.hidden);
    measure();
  });
  function attachHandles() {
    document.querySelectorAll('.tea-row').forEach(row => {
      if (row.querySelector('.row-resize')) return;
      const handle = document.createElement('button'); handle.type = 'button'; handle.className = 'row-resize';
      handle.setAttribute('aria-label', '拖动调整条目高度；方向键上下调整留白');
      handle.title = '拖动调节高度（保持店标大小）';
      let drag = null;
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        drag = {y: event.clientY, padding: settings['entry-pad']};
        handle.setPointerCapture(event.pointerId); event.preventDefault();
      });
      handle.addEventListener('pointermove', event => {
        if (!drag) return;
        settings['entry-pad'] = Math.min(32, Math.max(0, Math.round(drag.padding + (event.clientY - drag.y) / 2)));
        apply();
      });
      for (const name of ['pointerup','pointercancel','lostpointercapture']) handle.addEventListener(name, () => { drag = null; });
      handle.addEventListener('keydown', event => {
        if (!['ArrowUp','ArrowDown'].includes(event.key)) return;
        event.preventDefault(); settings['entry-pad'] = Math.max(0, Math.min(32, settings['entry-pad'] + (event.key === 'ArrowDown' ? 1 : -1))); apply();
      });
      row.append(handle); observer.observe(row);
    });
    measure();
  }
  const observer = new ResizeObserver(measure);
  document.getElementById('copy-station-layout').addEventListener('click', async () => {
    const stationStatus = document.getElementById('station-editor-status');
    try { await navigator.clipboard.writeText(exportText()); stationStatus.textContent = '已复制，粘贴给我即可。'; }
    catch {
      panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.textContent = '收起调节';
      document.body.classList.add('layout-editing');
      const field = document.getElementById('layout-export'); field.value = exportText(); field.hidden = false; field.focus(); field.select();
      stationStatus.textContent = '请复制下方已选中的参数。';
    }
  });
  new MutationObserver(attachHandles).observe(document.getElementById('entries'), {childList: true});
  document.getElementById('reset-layout').addEventListener('click', () => { settings = Object.fromEntries(controls.map(([id,,,,v]) => [id,v])); apply(); });
  document.getElementById('copy-layout').addEventListener('click', async () => {
    const field = document.getElementById('layout-export'); field.value = exportText();
    try { await navigator.clipboard.writeText(field.value); status.textContent = '参数已复制，粘贴到对话中即可。'; }
    catch { field.hidden = false; field.focus(); field.select(); status.textContent = '请复制下方已选中的参数。'; }
  });
  document.getElementById('download-layout').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([exportText()], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'milktea-layout.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  apply(false); attachHandles();
})();
