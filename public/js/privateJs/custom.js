
// my profile settings button (start)
function mySettingsFunction() {
    $(".settingsContent").addClass("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.settingsButton') && !event.target.matches('.far.fa-ellipsis-h')) {
        if ($(".settingsContent").hasClass('show')) {
            $(".settingsContent").removeClass("show");
        }
    }
}
// my profile settings button (end)
