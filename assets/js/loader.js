// Loading 動畫
export function initLoading() {
  document.querySelector(".pageLoader").style.display = "none";
  document.querySelector("main").style.display = "block";
}

export function toggleLoading(isLoading) {
  document.querySelector(".actionLoader").style.display = isLoading
    ? "flex"
    : "none";
  document.body.style.overflow = isLoading ? "hidden" : "auto";
}
