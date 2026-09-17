$(document).ready(function () {
  // The login and register screens share this bundle but have no session,
  // so the chat list must not be requested there.
  if (!document.body.getAttribute("data-user-id")) return;

  // When page load
  showChat();

  // shows chat html
  $("#mainSettingArea .chat").on("click", () => {
    showChat();
  });
});
