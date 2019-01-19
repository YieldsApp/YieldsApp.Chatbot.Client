var hebrewPattern = /[\u05D0-\u05EA]/;
var allDesignatedActions;
window.isReceiveMessage = true;
var receiveMessage = function () {
    $.get("/receiveMessage").then(function (data) {
        if (data.activities)
            appendMessage(data);
        if (window.isReceiveMessage)
            setTimeout(receiveMessage, 300);
    }, function (error) {
        appendMessage(CHAT_CONFIG.ErrorMessage);
    });
};
var appendMyMessage = function (value) {
    value = value.replace(/\n/g, "</br>");
    var chatElement = $('#chat');
    if (!chatElement.find(".chat_message_div_robot:last-child").length) {
        $("<div class=\"chat_user_message\">\n                <div style=\"text-align: " + (hebrewPattern.test(value) ? "right" : "left") + "\">\n                    " + value + "\n                </div>\n            </div>").insertBefore(chatElement.find(".receive_message:last-child .chat_message_div i"));
        ;
    }
    else {
        chatElement.append("<div class=\"receive_message\">\n                                  <div class=\"image\">\n                                      <img class=\"circle user\" src=\"../img/unnamed.jpg\">\n                                  </div>\n                                  <div class=\"chat_message_div\">\n                                      <div class=\"chat_user_message\">\n                                            <div style=\"text-align: " + (hebrewPattern.test(value) ? "right" : "left") + "\">\n                                                " + value + "\n                                                </div>\n                                       </div>\n                                      <i class=\"timesent\" data-time=\"" + moment() + "\"></i>\n                                  </div>\n                                </div>");
        $(".timesent").last().text(moment().fromNow());
        $('.typing-indicator').show();
    }
    $("#chat_area").scrollTop($("#chat_area").contents().height());
};
var appendText = function (text) {
    return "<div class=\"text\" style=\"text-align: " + (hebrewPattern.test(text) ? "right" : "left") + "\"> \n                " + text.replace(/\n/g, "</br>") + "\n            </div>";
};
var appendAttachmentList = function (attachments) {
    return '<div id="attachmentList" >' +
        attachments.map(function (attachment) { return createCard(attachment); }).join("") +
        '</div>';
};
var appendAttachmentCarousel = function (activity) {
    console.log("appendAttachmentCarousel", activity);
    return (activity.text ? '<div id="carouselTitle">' + activity.text.substring(0, activity.text.indexOf('<')) + '</div>' : '') + "\n             <div id=\"attachmentCarousel\" class=\"demo carousel slide\" data-ride=\"carousel\" data-interval=\"false\">  \n                <ul class=\"lightSlider\">" +
        activity.attachments.map(function (attachment, i) {
            return "<li class=\"item\">\n                              " + createCard(attachment) + "\n                               </li>";
        }).join("") +
        "</ul>\n        </div>";
};
var appendSuggestedActions = function (actions) {
    $("#message").attr('disabled', true);
    console.log("chat config",CHAT_CONFIG.listButtons);
    var chosenLinks= actions.attachments[0].content.buttons;
    if(actions.text.includes("בחר יעוד" )){
        allDesignatedActions=actions;
        chosenLinks=chosenLinks.filter(function (btn) {return CHAT_CONFIG.listButtons.indexOf(btn.value)>-1; });
    }
    return "<div class=\"suggestActions\">\n  <div class=\"titleSeggestedActions\" > \n" + actions.text + "\n </div>" +
    chosenLinks.map(function (btn) {
            return "<button class=\"btnSeggestadActions " + btn.type + "\" id=" + btn.value + " type=" + btn.type + ">" + btn.title + "</button>";
    }).join("")+("" + (actions.text.includes("בחר יעוד" )?
    '<button class=\"btnSeggestadActions bold\" id=\"other\">יעודים נוספים</button>' : '')) + '</div>';
};

var createCard = function (attachment) {
    return "<div class=\"attach\">\n                <div class=\"images\">\n                    " + attachment.content.images.map(function (img) { return "<img style='width: 100%;' height='2000' width='3000' src=\"../img/imgs/" + (CHAT_CONFIG.ImageUrls.indexOf(+img.url) != -1 ? img.url : CHAT_CONFIG.DefaultImg) + ".jpg\" />"; }).join("") + "\n                </div>\n                " + (attachment.content.title && "<div class=\"carouselTextContent title\" style=\"text-align: " + (hebrewPattern.test(attachment.content.title) ? "right" : "left") + " ;\"> \n                    " + attachment.content.title + "\n                    </div>") + "\n                 " + (attachment.content.subtitle && "<div class=\"carouselTextContent subtitle\" style=\"text-align: " + (hebrewPattern.test(attachment.content.subtitle) ? "right" : "left") + ";\"> \n                    " + (attachment.content.subtitle ? attachment.content.subtitle : '<br/>') + "\n                </div>") + "\n                 " + (attachment.content.text && "<div class=\"carouselTextContent textDesignation\" style=\"text-align: " + (hebrewPattern.test(attachment.content.text) ? "right" : "left") + ";\"> \n                    " + (attachment.content.text ? attachment.content.text : '<br/>') + "\n                </div>") + "\n                <div id=\"buttons\">\n                    " + attachment.content.buttons.map(function (a) {
        return "<a target=\"_blank\" class=\"linkButton " + (a.value == undefined ? "invisible " : "") + "\" title=\"" + a.title + "\" value=\"" + a.value + "\" href=\"" + a.value + "\"><span>" + a.title + "</span></a>";
    }).join("") + "\n                </div>\n            </div>";
};
var appendMessage = function (response) {
    if (response.activities.length)
        $('.typing-indicator').hide();
    console.log("response: ", response,"CHECK TITLE",response.activities);
    response.activities.forEach(function (activity) {
        var chatElement = $("#chat");
        chatElement.append("<div class=\"chat_message_div_robot receive_message\">\n                                  <div class=\"image\">\n                                      <img class=\"circle bot\"  src=\"../img/bot.jpg\">\n                                  </div>\n                                  <div class=\"chat_message_div\" " + (activity.attachmentLayout === 'carousel' && 'style="width:90%"') + ">\n <div class=\"chat_bot_message\">\n" + (activity.attachments ?
            activity.attachmentLayout === 'carousel' ?
                appendAttachmentCarousel(activity)+"<div class=\"text-center p-10\">"+activity.text.substring(activity.text.indexOf("<"),activity.text.length)+"</div>":
                appendSuggestedActions(activity) : "" ||
            activity.text ? appendText(activity.text) : "") + "\n                                      </div>\n                                      <i class=\"timesent\" data-time=\"" + moment() + "\"></i>\n                                  </div>                                  \n                        </div>");
        if (activity.attachmentLayout === 'carousel')
            chatElement.find('.lightSlider').last().lightSlider({
                gallery: false,
                item: 1,
                pager: false,
                slideMargin: activity.attachments.length - 1 && 10
            });
    });
    $(".timesent").last().text(moment().fromNow());
    $("#chat_area").scrollTop($("#chat_area").contents().height());
};
var openUrl = function (url) {
    window.open(url, "_blank");
};
$(document).ready(function () {
    var _this = this;
    var sendChatMessage = function (e) {
        e.preventDefault();
        var message = e.target.value ? e.target.value : $("#message")[0].value;
        if (!message.trim().length)
            return;
        appendMyMessage(message);
        $.post("/sendMessage", { message: message }).then(function (data) { }, function (error) { return appendMessage(CHAT_CONFIG.ErrorMessage); });
        e.target.value = "";
        $('#message').css('direction', 'rtl');
    };
    $("#message").on("keypress", function (e) {
        if (e.which == 13 && e.originalEvent.shiftKey !== true) {
            sendChatMessage(e);
        }
    });
    $("#message").on("keyup", function (e) {
        e.target.value.trim() ? $("#sendButton").prop('disabled', false) : $("#sendButton").prop('disabled', true);
    });
    $("#sendButton").on("click", function (e) {
        sendChatMessage(e);
        $("#message")[0].value = "";
        $("#sendButton").prop("disabled", true);
    });
    $("body").on("click", "div.chat_message_div_robot.receive_message:last-of-type .imBack", function (e) {
        $("#message").attr('disabled', false);
        var message = e.target.textContent;
        appendMyMessage(message);
        $.post("/sendMessage", { message: e.target.textContent }).then(function (data) { }, function (error) { return console.log(error); });
        $('#message').css('direction', 'rtl');
    });
    $("body").on("click", "div.chat_message_div_robot.receive_message:last-of-type #other", function (e) {
        $(".suggestActions:has(#other)").html('<div class="titleSeggestedActions"> בחר יעוד</div>');    
        var chosenLinks=allDesignatedActions.attachments[0].content.buttons;
        $(".suggestActions:last").append(chosenLinks.map(function (btn) {
        return "<button class=\"btnSeggestadActions " + btn.type + "\" id=" + btn.value + " type=" + btn.type + ">" + btn.title + "</button>";
        }).join(""));
    });
    $(".end").on("click", function () {
        window.location.reload();
    });
    var refreshSentTime = function () {
        $(".timesent").each(function () {
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });
    };
    setInterval(refreshSentTime, 6000);
    $('#message').bind('input propertychange', function (ev) {
        var text = ev.target.value;
        if (hebrewPattern.test(text) || ev.target.value == "") {
            $('#message').css('direction', 'rtl');
        }
        else {
            $('#message').css('direction', 'ltr');
        }
    });
    appendMessage(CHAT_CONFIG.InitialMessages);
    (window).isReceiveMessage = true;
    $("#chat_area").show();
    $.post("/create").then(function (data) {
        receiveMessage();
        $("#message").prop('disabled', false);
    }, function (error) { return console.log(error); });
    var Images = [];
    CHAT_CONFIG.ImageUrls.forEach((function (val) {
        _this.img = new Image(3000, 2000);
        _this.img.src = "../img/imgs/" + val + ".jpg";
        Images.push(_this.img);
    }));
});
