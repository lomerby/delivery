const iconPaths = {
  package: '<path d="m7.5 4.3 4.5-2.3 4.5 2.3 4.5 2.2-9 4.5-9-4.5 4.5-2.2Z"></path><path d="M3 6.5v10.9l9 4.6 9-4.6V6.5"></path><path d="M12 11v11"></path><path d="m7.5 4.3 9 4.5"></path>',
  bike: '<circle cx="6" cy="17" r="3.5"></circle><circle cx="18" cy="17" r="3.5"></circle><path d="M8.5 17H12l3-7h-4l-2.5 7Z"></path><path d="m14 7 2 3h3"></path><path d="M10 7h3"></path>',
  "shield-check": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-5"></path>',
  warehouse: '<path d="M3 21V9l9-6 9 6v12"></path><path d="M7 21v-8h10v8"></path><path d="M9 17h6"></path>',
  "map-pin": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
  truck: '<path d="M3 6h11v9H3z"></path><path d="M14 9h4l3 3v3h-7z"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"></path><path d="M22 2 11 13"></path>',
  search: '<circle cx="11" cy="11" r="7"></circle><path d="m21 21-5-5"></path>',
  "user-plus": '<circle cx="9" cy="8" r="4"></circle><path d="M3 21c0-4 3-7 6-7s6 3 6 7"></path><path d="M19 8v6"></path><path d="M16 11h6"></path>',
  "badge-check": '<path d="m12 2 2.5 3 3.9.3.3 3.9 3 2.8-3 2.8-.3 3.9-3.9.3L12 22l-2.5-3-3.9-.3-.3-3.9-3-2.8 3-2.8.3-3.9 3.9-.3L12 2Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path>',
  activity: '<path d="M22 12h-4l-3 8L9 4l-3 8H2"></path>',
  "package-check": '<path d="m7.5 4.3 4.5-2.3 4.5 2.3 4.5 2.2-9 4.5-9-4.5 4.5-2.2Z"></path><path d="M3 6.5v10.9l9 4.6 9-4.6V6.5"></path><path d="M12 11v11"></path><path d="m16 14 1.5 1.5L21 12"></path>',
  settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 1 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.9 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.7 1Z"></path>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path>'
};

function createIcons() {
  document.querySelectorAll("[data-lucide]").forEach((node) => {
    const name = node.dataset.lucide;
    const path = iconPaths[name];
    if (!path) return;

    node.outerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${path}
      </svg>
    `;
  });
}
