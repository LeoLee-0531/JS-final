// 訊息通知
export function showNotification(message) {
  var notificationModal = document.querySelector(".notificationModal");
  var notificationModalContent = document.querySelector(
    ".notificationModal-content"
  );
  let str = `
  <p>${message}</p> 
  `;
  notificationModalContent.innerHTML = str;
  notificationModal.style.display = "block";

  setTimeout(() => {
    notificationModal.style.display = "none";
  }, 2000);
}
