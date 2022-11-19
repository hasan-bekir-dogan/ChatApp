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

/*
$(document).keydown(function(e){ 
    if(e.which === 123){
       return false; 
    }
}); 
$(document).bind("contextmenu",function(e) {  
	e.preventDefault(); 
}); 

var currentHtmlContent; 
var element = new Image(); 
var elementWithHiddenContent = document.querySelector("#element-to-hide"); 
var innerHtml = elementWithHiddenContent.innerHTML; 
 
element.__defineGetter__("id", function() { 
    currentHtmlContent= ""; 
}); 
 
setInterval(function() { 
    currentHtmlContent= innerHtml; 
    console.log(element); 
    console.clear();  
    elementWithHiddenContent.innerHTML = currentHtmlContent; 
}, 1000); */