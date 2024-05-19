// Credits go to @codedraken on codepen.io
function handleSpoiler(evt) {
    const wrapper = evt.currentTarget;
    const content = wrapper.children[0];
  
    // toggle the visibility
    wrapper.classList.toggle("hidden");
  
    // set aria attributes for screen readers
    if (wrapper.classList.contains("hidden")) {
      wrapper.setAttribute("aria-expanded", false);
      wrapper.setAttribute("role", "button");
      wrapper.setAttribute("aria-label", "spoiler");
  
      content.setAttribute("aria-hidden", true);
    } else {
      wrapper.setAttribute("aria-expanded", true);
      wrapper.setAttribute("role", "presentation");
      wrapper.removeAttribute("aria-label");
  
      content.setAttribute("aria-hidden", false);
    }
  }
  
  // an array of our js-spoilers
  const jSpoilers = [...document.getElementsByClassName("js-spoiler")];
  
  // hard coding two event listeners to demonstrate a togglable and a one time only spoiler
  jSpoilers[0].addEventListener("click", handleSpoiler);
  jSpoilers[1].addEventListener("click", handleSpoiler, { once: true });
  jSpoilers[2].addEventListener("click", handleSpoiler);
  jSpoilers[3].addEventListener("click", handleSpoiler);
  jSpoilers[4].addEventListener("click", handleSpoiler);
  jSpoilers[5].addEventListener("click", handleSpoiler);
  jSpoilers[6].addEventListener("click", handleSpoiler);
  jSpoilers[7].addEventListener("click", handleSpoiler);
  jSpoilers[8].addEventListener("click", handleSpoiler);
  jSpoilers[9].addEventListener("click", handleSpoiler);
  jSpoilers[10].addEventListener("click", handleSpoiler);
  jSpoilers[11].addEventListener("click", handleSpoiler);
  jSpoilers[12].addEventListener("click", handleSpoiler);
  jSpoilers[13].addEventListener("click", handleSpoiler);
  jSpoilers[14].addEventListener("click", handleSpoiler);
  jSpoilers[15].addEventListener("click", handleSpoiler);