$(document).ready(function () {
    (<any>window).isChatOpen = true;

    $("#openButton").on("click", function (e) {
        e.preventDefault();
        $(".chat").toggle();
        $("#openButton").toggle();
        (<any>window).isChatOpen = true;
        $('.chat').attr('src', $('.chat').data('src'))
    });

    $('.chat').on('load', function () {
        (<any>window).isChatOpen = !(<any>window).isChatOpen;
        if ((<any>window).isChatOpen) {
            $("#openButton").toggle();
            $(".chat").toggle();
            $('.chat').attr('src', "");
        }
    }
});
