const hebrewPattern = /[\u05D0-\u05EA]/;
let allDesignatedActions;
(<any>window).isReceiveMessage = true;

const receiveMessage = function () {
    $.get("/receiveMessage").then(
        data => {
            if (data.activities)
                appendMessage(data);
            if ((<any>window).isReceiveMessage)
                setTimeout(receiveMessage, 300);
        }, 
        error => {
            appendMessage(CHAT_CONFIG.ErrorMessage)
        }
    );
}

const appendMyMessage = (value) => {
    value = value.replace(/\n/g, "</br>");
    var chatElement = $('#chat')
    if (!chatElement.find(".chat_message_div_robot:last-child").length) {
        $(`<div class="chat_user_message">
                <div style="text-align: ${hebrewPattern.test(value) ? "right" : "left"}">
                    ${value}
                </div>
            </div>`).insertBefore(chatElement.find(".receive_message:last-child .chat_message_div i"));
        ;
    } else {
        chatElement.append(`<div class="receive_message">
                                  <div class="image">
                                      <img class="circle user" src="../img/unnamed.jpg">
                                  </div>
                                  <div class="chat_message_div">
                                      <div class="chat_user_message">
                                            <div style="text-align: ${hebrewPattern.test(value) ? "right" : "left"}">
                                                ${value}
                                                </div>
                                       </div>
                                      <i class="timesent" data-time="${moment()}"></i>
                                  </div>
                                </div>`)
        $(".timesent").last().text(moment().fromNow());
        $('.typing-indicator').show();
    }
    $("#chat_area").scrollTop($("#chat_area").contents().height());
}

const appendText = (text: string) => {
    return `<div class="text" style="text-align: ${hebrewPattern.test(text) ? "right" : "left"}"> 
                ${text.replace(/\n/g, "</br>")}
            </div>`;
}

const appendAttachmentList = (attachments: any) => {
    return '<div id="attachmentList" >' +
        attachments.map(attachment => createCard(attachment)).join("") +
        '</div>';
}

const appendAttachmentCarousel = (activity: any) => {
    console.log("appendAttachmentCarousel", activity);
    return `${activity.text ? '<div id="carouselTitle">' + activity.text.substring(0, activity.text.indexOf("<"))  + '</div>' : ''}
             <div id="attachmentCarousel" class="demo carousel slide" data-ride="carousel" data-interval="false">  
                <ul class="lightSlider">` +
        activity.attachments.map((attachment, i) =>
            `<li class="item">
                              ${ createCard(attachment)}
                               </li>`
        ).join("") +
        `</ul>
        </div>`;
}

const appendSuggestedActions = (actions: any) => {
    $("#message").attr('disabled', true);
    let chosenLinks= actions.attachments[0].content.buttons;
    if(actions.text.includes("בחר יעוד" )){
        allDesignatedActions=actions;
        chosenLinks=chosenLinks.filter((btn)=>{return CHAT_CONFIG.listButtons.indexOf(btn.value)>-1; })
    }
    return `<div class="suggestActions">
             <div class="titleSeggestedActions" >
                ${actions.text}
              </div>` +
        chosenLinks.map(btn =>
            `<button class="btnSeggestadActions ${btn.type}" id=${btn.value} type=${btn.type}>${btn.title}</button>`).join("") +
       `${actions.text.includes("בחר יעוד" )?`<button class="btnSeggestadActions bold" id="other">יעודים נוספים</button>`:''}`+
        '</div>';
}

const otherOptions= ()=> {
    $(".suggestActions:has(#other)").html('<div class="titleSeggestedActions"> בחר יעוד</div>');    
    let chosenLinks=allDesignatedActions.attachments[0].content.buttons;
    $(".suggestActions:last").append(chosenLinks.map(btn =>
            `<button class="btnSeggestadActions ${btn.type}" id=${btn.value} type=${btn.type}>${btn.title}</button>`)
            .join(""))
};

const createCard = attachment => {
    return `<div class="attach">
                <div class="images">
                    ${attachment.content.images.map(img => `<img style='width: 100%;' height='2000' width='3000' src="../img/imgs/${CHAT_CONFIG.ImageUrls.indexOf(+img.url) != -1 ? img.url : CHAT_CONFIG.DefaultImg}.jpg" />`).join("")}
                </div>
                ${attachment.content.title && `<div class="carouselTextContent title" style="text-align: ${hebrewPattern.test(attachment.content.title) ? "right" : "left"} ;"> 
                    ${attachment.content.title}
                    </div>`}
                 ${attachment.content.subtitle && `<div class="carouselTextContent subtitle" style="text-align: ${hebrewPattern.test(attachment.content.subtitle) ? "right" : "left"};"> 
                    ${attachment.content.subtitle ? attachment.content.subtitle : '<br/>'}
                </div>`}
                 ${attachment.content.text && `<div class="carouselTextContent textDesignation" style="text-align: ${hebrewPattern.test(attachment.content.text) ? "right" : "left"};"> 
                    ${attachment.content.text ? attachment.content.text : '<br/>'}
                </div>`}
                <div id="buttons">
                    ${attachment.content.buttons.map(a =>
            `<a target="_blank" class="linkButton ${a.value == undefined?"invisible ":""}"  title="${a.title}" value="${a.value}" href="${a.value}"><span>${a.title}</span></a>`
        ).join("")}
                </div>
            </div>`
}

const appendMessage = (response: any) => {
    if (response.activities.length)
        $('.typing-indicator').hide();
    console.log("response: ", response);
    response.activities.forEach(activity => {
        var chatElement = $("#chat");
        chatElement.append(`<div class="chat_message_div_robot receive_message">
                                  <div class="image">
                                      <img class="circle bot"  src="../img/bot.jpg">
                                  </div>
                                  <div class="chat_message_div" ${activity.attachmentLayout === 'carousel' && 'style="width:90%"'}>
                                      <div class="chat_bot_message">
                                            ${activity.attachments ?
                activity.attachmentLayout === 'carousel' ?
                    appendAttachmentCarousel(activity)+"<div class=\"text-center p-10\">"+activity.text.substring(activity.text.indexOf("<"),activity.text.length)+"</div>" :
                    appendSuggestedActions(activity) : "" ||
                        activity.text ? appendText(activity.text) : ""}
                       
                                      </div>
                                      <i class="timesent" data-time="${moment()}"></i>
                                  </div>                                  
                        </div>`);
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
}

const openUrl = (url: any) => {
    window.open(url, "_blank");
}

$(document).ready(function () {
    const sendChatMessage = (e) => {
        e.preventDefault();
        var message = e.target.value ? e.target.value : $("#message")[0].value;
        if (!message.trim().length)
            return;
        appendMyMessage(message);
        $.post("/sendMessage", { message: message }).then(
            data => { },
            error => appendMessage(CHAT_CONFIG.ErrorMessage)
        );
        e.target.value = "";
        $('#message').css('direction', 'rtl')
    }

    $("#message").on("keypress", e => {
        if (e.which == 13 && e.originalEvent.shiftKey !== true) {
            sendChatMessage(e);
        }
    });

    $("#message").on("keyup", e => {
        e.target.value.trim() ? $("#sendButton").prop('disabled', false) : $("#sendButton").prop('disabled', true);
    });

    $("#sendButton").on("click", e => {
        sendChatMessage(e);
        $("#message")[0].value = "";
        $("#sendButton").prop("disabled", true);
    })
$("body").on("click", "div.chat_message_div_robot.receive_message:last-of-type #other",(e)=> {
    $(".suggestActions:has(#other)").html('<div class="titleSeggestedActions"> בחר יעוד</div>');    
    let chosenLinks=allDesignatedActions.attachments[0].content.buttons;
    $(".suggestActions:last").append(chosenLinks.map(btn =>
        `<button class="btnSeggestadActions ${btn.type}" id=${btn.value} type=${btn.type}>${btn.title}</button>`)
    .join(""))
});
    $("body").on("click", "div.chat_message_div_robot.receive_message:last-of-type .imBack", function (e) {
        $("#message").attr('disabled', false)
        var message = e.target.textContent;
        appendMyMessage(message);
        $.post("/sendMessage", { message: e.target.textContent }).then(
            data => { },
            error => console.log(error)
        );
        $('#message').css('direction', 'rtl')
    });

    $(".end").on("click", function () {
        window.location.reload();
    });

    const refreshSentTime = () => {
        $(".timesent").each(function () {
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });
    }

    setInterval(refreshSentTime, 6000);

    $('#message').bind('input propertychange', function (ev) {
        var text = ev.target.value;
        if (hebrewPattern.test(text) || ev.target.value == "") {
            $('#message').css('direction', 'rtl')
        } else {
            $('#message').css('direction', 'ltr')
        }
    });

    appendMessage(CHAT_CONFIG.InitialMessages);
    (<any>(window)).isReceiveMessage = true;
    $("#chat_area").show();
    $.post("/create").then(
        data => {
            receiveMessage();
            $("#message").prop('disabled', false);
        },
        error => console.log(error)
    );
    var Images = [];
    CHAT_CONFIG.ImageUrls.forEach((val => {
        this.img = new Image(3000, 2000);
        this.img.src = `../img/imgs/${val}.jpg`;
        Images.push(this.img);
    }))
});
