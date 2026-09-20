document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('/Quick_Start.html')) {
    const legacyAnchors = {
      '#id1': 'Quick_Start.html#quick-start',
      '#id2': 'Environment.html#id2',
      '#id3': 'Environment.html#id3',
      '#id4': 'Environment.html#id4',
      '#wifi': 'Environment.html#wifi',
      '#wifi-ap': 'Environment.html#wifi-ap',
      '#id5': 'Environment.html#id5',
      '#id6': 'Environment.html#id6',
      '#ros2-sdk': 'ROS2_Reference.html#ros2-sdk',
      '#id7': 'ROS2_Reference.html#api-controller-state',
      '#command-sdk': 'ROS2_Reference.html#api-command',
      '#id8': 'Control_Tuning.html#policy-replacement',
      '#lqr': 'Control_Tuning.html#lqr-tuning',
      '#id9': 'Control_Tuning.html#controller-tuning',
    };
    const destination = legacyAnchors[window.location.hash];
    if (destination) {
      window.location.replace(destination);
      return;
    }
  }

  const searchInput = document.querySelector('.sidebar-search');
  const navigationToggle = document.getElementById('__navigation');
  const sidebarLinks = [...document.querySelectorAll('.sidebar-tree a.reference')];
  const currentPageLink = document.querySelector('.sidebar-tree .current-page > a');

  if (currentPageLink) currentPageLink.setAttribute('aria-current', 'page');

  const updateSidebarLocation = () => {
    sidebarLinks.forEach((link) => {
      if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
    });
    const activeLink = window.location.hash && sidebarLinks.find((link) => (
      link.pathname === window.location.pathname && link.hash === window.location.hash
    ));
    if (activeLink) {
      activeLink.setAttribute('aria-current', 'location');
      let branch = activeLink.closest('li');
      while (branch) {
        const toggle = branch.querySelector(':scope > .toctree-checkbox');
        if (toggle) toggle.checked = true;
        branch = branch.parentElement.closest('li');
      }
    }
    const visibleLink = activeLink || currentPageLink;
    if (visibleLink) visibleLink.scrollIntoView({ block: 'nearest' });
  };

  updateSidebarLocation();
  window.addEventListener('hashchange', updateSidebarLocation);

  sidebarLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (!navigationToggle || !window.matchMedia('(max-width: 67em)').matches) return;
      navigationToggle.checked = false;
      if (link.pathname !== window.location.pathname) return;
      const target = link.hash
        ? document.getElementById(decodeURIComponent(link.hash.slice(1)))
        : document.getElementById('furo-main-content');
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    });
  });

  document.querySelectorAll('article pre, article table.docutils').forEach((region) => {
    region.tabIndex = 0;
  });

  const skipLink = document.querySelector('.skip-to-content');
  if (skipLink) skipLink.textContent = '跳转到正文';
  const backToTopLabel = document.querySelector('.back-to-top span');
  if (backToTopLabel) backToTopLabel.textContent = '返回顶部';

  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.setAttribute('aria-label', '切换浅色、深色或跟随系统');
    button.setAttribute('title', '切换浅色、深色或跟随系统');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"], dialog[open]')) return;
    if (!searchInput) return;
    event.preventDefault();
    if (navigationToggle && window.matchMedia('(max-width: 67em)').matches) navigationToggle.checked = true;
    searchInput.focus();
  });

  let imageDialog;
  let imageTrigger;
  document.querySelectorAll('article a.image-reference').forEach((link) => {
    const image = link.querySelector('img');
    if (!image) return;
    image.loading = 'lazy';
    link.setAttribute('aria-label', `放大图片：${image.alt || '文档插图'}`);
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (typeof HTMLDialogElement === 'undefined') return;
      event.preventDefault();
      if (!imageDialog) {
        imageDialog = document.createElement('dialog');
        imageDialog.className = 'image-dialog';
        imageDialog.setAttribute('aria-label', '文档图片预览');
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.textContent = '关闭 · Esc';
        closeButton.addEventListener('click', () => imageDialog.close());
        imageDialog.append(closeButton, document.createElement('img'), document.createElement('p'));
        imageDialog.addEventListener('click', (clickEvent) => {
          if (clickEvent.target === imageDialog) imageDialog.close();
        });
        imageDialog.addEventListener('close', () => imageTrigger?.focus());
        document.body.append(imageDialog);
      }
      const previewImage = imageDialog.querySelector('img');
      previewImage.src = link.href;
      previewImage.alt = image.alt;
      imageDialog.querySelector('p').textContent = image.alt;
      imageTrigger = link;
      imageDialog.showModal();
    });
  });
});
