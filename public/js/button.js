$(document).ready(function () {
    window.isChatOpen = true;
    $("#openButton").on("click", function (e) {
        e.preventDefault();
        $(".chat").toggle();
        $("#openButton").toggle();
        window.isChatOpen = true;
        $('.chat').attr('src', $('.chat').data('src'));
    });
    $('.chat').on('load', function () {
        window.isChatOpen = !window.isChatOpen;
        if (window.isChatOpen) {
            $("#openButton").toggle();
            $(".chat").toggle();
            $('.chat').attr('src', "");
        }
    });
});
