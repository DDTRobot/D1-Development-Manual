document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('/Quick_Start.html')) {
    const legacyAnchors = {
      '#environment-dependencies': 'Environment.html#environment-dependencies',
      '#system-environment': 'Environment.html#system-environment',
      '#network-environment': 'Environment.html#network-environment',
      '#wi-fi-hotspot-connection': 'Environment.html#wi-fi-connection',
      '#wi-fi-ap-hotspot-mode': 'Environment.html#wi-fi-ap-hotspot-mode',
      '#ethernet-port-configuration': 'Environment.html#ethernet-port-configuration',
      '#install-build-tools': 'Environment.html#install-build-tools',
      '#ros2-sdk': 'ROS2_Reference.html#ros2-sdk',
      '#get-the-quadruped-biped-controller-status': 'ROS2_Reference.html#api-controller-state',
      '#upper-level-command-sdk-interface': 'ROS2_Reference.html#api-command',
      '#policy-replacement': 'Control_Tuning.html#policy-replacement',
      '#controller-tuning': 'Control_Tuning.html#controller-tuning',
    };
    const destination = legacyAnchors[window.location.hash];
    if (destination) {
      window.location.replace(destination);
      return;
    }
  }

  const specificationsLink = document.querySelector('.d1-home .product-preview');
  const legacyHomeSections = new Set([
    '#product-introduction',
    '#d1-specifications',
    '#d-infinite-d1-specification-v2-3',
    '#specification-table',
    '#acknowledgment',
  ]);
  const redirectHomeSection = () => {
    if (!specificationsLink || !legacyHomeSections.has(window.location.hash)) return false;
    const destination = new URL(specificationsLink.href);
    destination.hash = window.location.hash;
    window.location.replace(destination.href);
    return true;
  };
  if (redirectHomeSection()) return;
  if (specificationsLink) window.addEventListener('hashchange', redirectHomeSection);

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
  if (skipLink) skipLink.textContent = 'Skip to content';
  const backToTopLabel = document.querySelector('.back-to-top span');
  if (backToTopLabel) backToTopLabel.textContent = 'Back to top';

  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.setAttribute('aria-label', 'Switch between light, dark, and system themes');
    button.setAttribute('title', 'Switch between light, dark, and system themes');
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
  document.querySelectorAll('article img').forEach((image) => {
    if (image.closest('a, button')) return;
    const imageLink = document.createElement('a');
    imageLink.href = image.src;
    imageLink.className = 'image-reference';
    image.replaceWith(imageLink);
    imageLink.append(image);
  });
  document.querySelectorAll('article a.image-reference').forEach((link) => {
    const image = link.querySelector('img');
    if (!image) return;
    image.loading = 'lazy';
    link.setAttribute('aria-label', `Enlarge image: ${image.alt || 'Documentation image'}`);
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (typeof HTMLDialogElement === 'undefined') return;
      event.preventDefault();
      if (!imageDialog) {
        imageDialog = document.createElement('dialog');
        imageDialog.className = 'image-dialog';
        imageDialog.setAttribute('aria-label', 'Documentation image preview');
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.textContent = 'Close · Esc';
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
