var hebrewPattern = /[\u05D0-\u05EA]/;
var appendMyMessage = function (value) {
    value = value.replace(/\n/g, "</br>");
    if (!$("#chat .chat_message_div_robot:last-child").length) {
        $("#chat .receive_message:last-child .chat_message div").append("</br>" + value);
    }
    else {
        $("#chat").append("<div class=\"receive_message\">\n                                  <div class=\"image\">\n                                      <img src=\"../img/unnamed.jpg\">\n                                  </div>\n                                  <div class=\"chat_message_div\">\n                                      <div class=\"chat_message\"><div style=\"text-align: " + (hebrewPattern.test(value) ? "right" : "left") + "\">" + value + "</div></div>\n                                      <i class=\"timesent\" data-time=\"" + moment() + "\"></i>\n                                  </div>\n                                </div>");
        $(".timesent").last().text(moment().fromNow());
    }
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
};
var appendText = function (text) {
    return "<div style=\"text-align: " + (hebrewPattern.test(text) ? "right" : "left") + "\"> " + text.replace(/\n/g, "</br>") + " </div>";
};
var appendAttachment = function (attachments) {
    return '<div id="attachment">' + attachments.map(function (attachment) { return createCard(attachment); }).join("") + '</div>';
};
var createCard = function (attachment) {
    return "<div class=\"attach\"><div id=\"title\" style=\"text-align: " + (hebrewPattern.test(attachment.content.title) ? "right" : "left") + "\"> \n                " + attachment.content.title + "\n            </div>\n            <div id=\"subtitle\" style=\"text-align: " + (hebrewPattern.test(attachment.content.subtitle) ? "right" : "left") + "\"> \n                " + attachment.content.subtitle + "\n            </div>\n            <div id=\"images\">\n                " + attachment.content.images.map(function (img) { return "<img src=" + img.url + "/>"; }).join("") + "\n            </div>\n            <div id=\"buttons\">\n                " + attachment.content.buttons.map(function (button) { return "<button title=" + button.title + " value=" + button.value + ">" + button.title + "</button>"; }).join("") + "\n            </div></div>";
};
var appendMessage = function (response) {
    response.activities.forEach(function (activity) {
        $("#chat").append("<div class=\"chat_message_div_robot receive_message\">\n                                  <div class=\"image\">\n                                      <img src=\"../img/bot.jpg\">\n                                  </div>\n                                  <div class=\"chat_message_div\">\n                                      <div class=\"chat_message\">\n                                            " + (activity.text ? appendText(activity.text) : "") + "\n                                            " + (activity.attachments ? appendAttachment(activity.attachments) : "") + "\n                                      </div>\n                                      <i class=\"timesent\" data-time=\"" + moment() + "\"></i>\n                                  </div>                                  \n                        </div>");
    });
    $(".timesent").last().text(moment().fromNow());
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
};
$(document).ready(function () {
    $.post("/create").then(function (data) {
        appendMessage(data);
        $("#message").prop('disabled', false);
    }, function (error) { return console.log(error); });
    $("#message").on("keypress", function (e) {
        if (e.which == 13 && e.originalEvent.shiftKey !== true) {
            e.preventDefault();
            appendMyMessage(e.target.value);
            $.post("/sendMessage", { message: e.target.value }).then(function (data) { return appendMessage(data); }, function (error) { return console.log(error); });
            e.target.value = "";
            $('#message').css('direction', 'rtl');
        }
    });
    $(".sprite_exit").on("click", function () {
        $("#openButton").toggle();
        $(".chat-container").toggle();
    });
    $("#openButton").on("click", function () {
        $(".chat-container").toggle();
        $("#openButton").toggle();
        $("#chat_area").show();
    });
    $(".sprite_down").on("click", function () { return $("#chat_area").toggle(); });
    setInterval(function () {
        $(".timesent").each(function () {
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });
    }, 6000);
    $('#message').bind('input propertychange', function (ev) {
        var text = ev.target.value;
        if (hebrewPattern.test(text) || ev.target.value == "") {
            $('#message').css('direction', 'rtl');
        }
        else {
            $('#message').css('direction', 'ltr');
        }
    });
});
//# sourceMappingURL=chatScript.js.map