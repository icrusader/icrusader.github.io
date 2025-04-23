
// Enhance Markdown responsiveness
document.querySelectorAll('.markdown-body img').forEach(img => {
  img.setAttribute('loading', 'lazy');
});

document.querySelectorAll('.markdown-body table').forEach(table => {
  const wrapper = document.createElement('div');
  wrapper.style.overflowX = 'auto';
  wrapper.style.width = '100%';
  table.parentNode.insertBefore(wrapper, table);
  wrapper.appendChild(table);
});

