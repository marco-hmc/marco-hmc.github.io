// Based on randomwits.com/blog/dark-mode-jekyll
darkmode()

document.getElementsByClassName('dark-mode-button')[0].onclick = function() {
  toggleDarkMode()
}

function darkmode() {
  let enabled = localStorage.getItem('dark-mode')

  if (enabled === null) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        enable();
    }
  } else if (enabled === 'true') {
    enable()
  }
}

function toggleDarkMode() {
  if (localStorage.getItem('dark-mode') === 'false' || localStorage.getItem('dark-mode') === null) {
    enable();
  } else {
    disable();
  }
}

function enable()  {
  DarkReader.setFetchMethod(window.fetch)
  DarkReader.enable();
  localStorage.setItem('dark-mode', 'true');

  document.getElementsByClassName("dark-mode-button")[0].innerHTML = "<i class=\"ion ion-md-sunny\"></i>";
}

function disable() {
  DarkReader.disable();
  localStorage.setItem('dark-mode', 'false');

  document.getElementsByClassName('dark-mode-button')[0].innerHTML = "<i class=\"ion ion-md-moon\"></i>";
}
