// ajax loader (begin)
function showChatAjaxLoader() {
  let ajaxloader = "";

  // Ajax Loader
  ajaxloader += `<div id="ajaxLoader" class="pt-5">
                      <div class="spinner-border text-success" role="status">
                      </div>
                  </div>`;

  $(".surface .main .person >div:not(:first-child)").remove();
  $(ajaxloader).insertAfter(".profileInfoArea");
}

function hideChatAjaxLoader() {
  $("#ajaxLoader").remove();
}

function showChatDetailAjaxLoader() {
  let ajaxloader = "";

  // Ajax Loader
  ajaxloader += `<div id="ajaxChatDetailLoader" class="pt-5">
                      <div class="spinner-border text-success" role="status">
                      </div>
                  </div>`;

  $(".surface .main .personDetail .body").html(ajaxloader);
}

function hideChatDetailAjaxLoader() {
  $("#ajaxChatDetailLoader").remove();
}
// ajax loader (end)



// contacts (begin)
function showContacts() {
  showChatAjaxLoader();

  $.ajax({
    url: "/person/list",
    method: "GET",
    dataType: "json",
    success: (response) => {
      if (response.status == "success") {
        let contactshtml = "";

        let contactsdata = response.data.contacts;

        // Search
        contactshtml += `<div class="searchMainArea">
                                    <div class="searchArea">
                                        <input type="text" class="search" placeholder="Search">
                                        <i class="fas fa-search"></i>
                                    </div>
                                    <button class="newChatButton" onclick="showCreatePerson()" title="Create New Person">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>`;

        // Contacts
        contactshtml += `<div class="personList contactsArea">`;

        for (let i = 0; i < contactsdata.length; i++) {
          contactshtml += `<div class="eachPerson contacts" data-id="${contactsdata[i]._id}">
                                        <hr class="topLine">
                                        <img class="profilePhoto" src="/images/default-image.png" alt="">
                                        <div class="content">
                                            <div class="name">
                                                ${contactsdata[i].name}
                                            </div>
                                            <div class="actions">
                                              <button class="deletePerson" onclick="deletePerson('${contactsdata[i]._id}')"><i class="fas fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                        <hr class="bottomLine">
                                    </div>`;
        }

        contactshtml += `</div>`;

        hideChatAjaxLoader();
        $("#mainSettingArea >button").removeClass("active");
        $("#mainSettingArea .contacts").addClass("active");
        $(contactshtml).insertAfter(".profileInfoArea");
      }
    },
    error: (response) => {
      toastr.error("You got an error!");
    },
  });
}

function showCreatePerson() {
  showChatAjaxLoader();

  let createpersonhtml = "";

  // Profile
  createpersonhtml += `<div class="profileArea createPersonArea">
                        <button class="close" onclick="showContacts()">
                            <i class="fas fa-times"></i>
                        </button>
                        <div class="formElement">
                            <label for="personEmail">E-mail</label>
                            <input type="text" name="personEmail" id="personEmail">
                        </div>
                        <div class="buttonsArea">
                            <button class="cancel" onclick="showContacts()">Cancel</button>
                            <button class="create" onclick="createPerson()">Create</button>
                        </div>
                    </div>`;

  hideChatAjaxLoader();
  $("#mainSettingArea >button").removeClass("active");
  $("#mainSettingArea .contacts").addClass("active");
  $(createpersonhtml).insertAfter(".profileInfoArea");
}

function createPerson() {
  // get data
  let personemail = $(".surface .main .person .profileArea.createPersonArea .formElement #personEmail").val();

  // disable elements
  $(".surface .main .person .profileArea.createPersonArea .formElement #personEmail").prop("disabled", true);
  $(".surface .main .person .profileArea.createPersonArea .buttonsArea .cancel").prop("disabled", true);
  $(".surface .main .person .profileArea.createPersonArea .buttonsArea .create").prop("disabled", true);

  $.ajax({
    url: "/person/create",
    method: "POST",
    dataType: "json",
    data: {
      email: personemail,
    },
    success: (response) => {
      if (response.status == "success") {
        showContacts()

        toastr.success('Person successfully created.')
      }
    },
    error: (response) => {
      toastr.error("You got an error!");

      $("#createPerson").prop("disabled", false);
      $("#cancelCreationPerson").prop("disabled", false);
    },
  });
}

function deletePerson(p_userId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {

      $.ajax({
        url: "/person/delete",
        method: "DELETE",
        dataType: "json",
        data: {
          userId: p_userId
        },
        success: (response) => {
          if (response.status == "success") {
            
            $(`.surface .main .person .personList.contactsArea .eachPerson.contacts[data-id="${p_userId}"]`).remove()

            toastr.success("Message has been deleted.");
          }
        },
        error: (response) => {
          toastr.error("You got an error!");
        },
      });
    }
  });
}
// contacts (end)



// chat (begin)
function showChat() {
  showChatAjaxLoader();

  $.ajax({
    url: "/chat",
    method: "GET",
    dataType: "json",
    success: (response) => {
      if (response.status == "success") {
        let chathtml = "";
        let chat = response.data.chat;
        let date;

        // Search Header
        chathtml = `<div class="searchMainArea">
                            <div class="searchArea">
                                <input type="text" class="search" placeholder="Search">
                                <i class="fas fa-search"></i>
                            </div>
                            <button class="newChatButton" onclick="showContactsToSendMessage()" title="Type to a person">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>`;

        // Main Chat
        chathtml += `<div class="personList">`;

        // Main chat Each Person
        for (let i = 0; i < chat.length; i++) {
          chathtml += `<div class="eachPerson" onclick="showChatDetail('${chat[i].userId}')" data-id="${chat[i].userId}">
                            <hr class="topLine">
                            <img class="profilePhoto" src="/images/default-image.png" alt="">
                            <div class="content">
                                <div class="name">
                                    ${chat[i].name}
                                </div>
                                <div class="shortDetail">`;

          if (chat[i].type == "sender") {
            chathtml += "Me: ";
          }

          chathtml += `             ${chat[i].lastMessage}
                                </div>
                            </div>
                            <div class="time">`;

          date = new Date(chat[i].date).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          });

          chathtml += String(date);

          chathtml += `     </div>
                            <hr class="bottomLine">
                        </div>`;
        }

        chathtml += `</div>`;

        hideChatAjaxLoader();
        $("#mainSettingArea >button").removeClass("active");
        $("#mainSettingArea .chat").addClass("active");
        $(chathtml).insertAfter(".profileInfoArea");
      }
    },
    error: (response) => {
      toastr.error("You got an error!");
    },
  });
}

function showChatDetail(p_receiverUserId) {
  showChatDetailAjaxLoader();

  $.ajax({
    url: "/chat/detail",
    method: "POST",
    dataType: "json",
    data: {
      receiverUserId: p_receiverUserId,
    },
    success: (response) => {
      if (response.status == "success") {
        let chatdetailhtml = "";
        let chatmaindetailhtml = "";
        let messages = response.data.messages;
        let receiverName = response.data.recevierName;
        let receiverEmail = response.data.recevierEmail;
        let date;
        let message = "", endOfDate;

        // Chat each message
        for (let i = 0; i < messages.length; i++) {
          chatdetailhtml += `<div class="eachMessage `;

          if (messages[i].usertype == "sender") chatdetailhtml += "me";
          else chatdetailhtml += "you";

          chatdetailhtml += `" data-id="${messages[i]._id}">
                          <div class="subRegion">
                              <div class="messageArea">
                                  <div class="message">
                                      ${messages[i].text}
                                  </div>
                                  <div class="time">`;
          date = new Date(messages[i].createdAt).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          });

          chatdetailhtml += String(date);

          chatdetailhtml += `     </div>
                                  <button class="deleteMessage" onclick="deleteMessage('${messages[i]._id}')">
                                    <i class="far fa-times"></i>
                                  </button>
                              </div>
                          </div>
                      </div>`;

          if (i == messages.length - 1) {
            if (messages[i].usertype == "sender") message += "Me: ";

            message += messages[i].text;
            endOfDate = date;
          }
        }

        if ($(".surface .main .personDetail").hasClass("mainPage")) {
          chatmaindetailhtml += `<div class="bodyBackground"></div>
                                  <div class="header">
                                      <div class="infoArea">
                                          <img class="profilePhoto" src="/images/default-image.png" alt="">
                                          <div class="content">
                                              <div class="name">
                                                  ${receiverName}
                                              </div>
                                              <div class="shortDetail">
                                                  ${receiverEmail}
                                              </div>
                                          </div>
                                      </div>
                                      <div class="settings">
                                          <a class="settingButton" href="#">
                                              <i class="far fa-info-circle"></i>
                                          </a>
                                      </div>
                                  </div>
                                  <div class="body" id="chatBody">
                                    ${chatdetailhtml}
                                  </div>
                                  <div class="footer">
                                      <textarea class="text" name="text" placeholder="Type a message" onkeypress="sendMessageKeyPress(event)"></textarea>
                                      <button class="sendButton" onclick="sendMessage()">
                                          <i class="fas fa-paper-plane"></i>
                                      </button>
                                  </div>`;

          $(".surface .main .personDetail").removeClass("mainPage");
          $(
            `.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"]`
          ).addClass("active");

          $(".surface .main .personDetail").html(chatmaindetailhtml);
        } else {
          // set receiver name and email in detail side
          $(".personDetail .header .infoArea .content .name").html(
            receiverName
          );
          $(".personDetail .header .infoArea .content .shortDetail").html(
            receiverEmail
          );

          // hide ajax loader
          hideChatDetailAjaxLoader();

          // set chat detail body
          $(
            `.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"]`
          ).addClass("active");

          $(".surface .main .personDetail .body").html(chatdetailhtml);
        }

        $(".surface .main .personDetail").attr("data-id", p_receiverUserId);

        // scroll bottom on person detail area
        let scroll_to_bottom = document.getElementById("chatBody");
        scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;

        // active each person
        $('.surface .main .person .personList .eachPerson.active').removeClass('active')
        $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"]`).addClass('active')

        // set active person info
        $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"] .content .shortDetail`).html(message);
        $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"] .time`).html(endOfDate);
      }
    },
    error: (response) => {
      toastr.error("You got an error!");
    },
  });
}

function startChat(p_receiverUserId) {

  $.ajax({
    url: '/chat/check-exist',
    method: 'POST',
    dataType: 'json',
    data: {
      receiverUserId: p_receiverUserId
    },
    success: (response) => {
      if (response.status == 'success') {
        if (response.data.checkExist == true) {
          showChatDetail(p_receiverUserId)
        }
        else {
          let chatdetailhtml = "";
          let chatmaindetailhtml = "";
          let receiverName = response.data.recevierName;
          let receiverEmail = response.data.recevierEmail;

          if ($(".surface .main .personDetail").hasClass("mainPage")) {
            chatmaindetailhtml += `<div class="bodyBackground"></div>
                                    <div class="header">
                                        <div class="infoArea">
                                            <img class="profilePhoto" src="/images/default-image.png" alt="">
                                            <div class="content">
                                                <div class="name">
                                                    ${receiverName}
                                                </div>
                                                <div class="shortDetail">
                                                    ${receiverEmail}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="settings">
                                            <a class="settingButton" href="#">
                                                <i class="far fa-info-circle"></i>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="body" id="chatBody">
                                      ${chatdetailhtml}
                                    </div>
                                    <div class="footer">
                                        <textarea class="text" name="text" placeholder="Type a message" onkeypress="sendMessageKeyPress(event)"></textarea>
                                        <button class="sendButton" onclick="sendMessage()">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>`;

            $(".surface .main .personDetail").removeClass("mainPage");
            $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"]`).addClass("active");

            $(".surface .main .personDetail").html(chatmaindetailhtml);
          }
          else {
            // set receiver name and email in detail side
            $(".personDetail .header .infoArea .content .name").html(receiverName);
            $(".personDetail .header .infoArea .content .shortDetail").html(receiverEmail);

            // hide ajax loader
            hideChatDetailAjaxLoader();

            // set chat detail body
            $( `.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"]`).addClass("active");

            $(".surface .main .personDetail .body").html(chatdetailhtml);
          }

          $(".surface .main .personDetail").attr("data-id", p_receiverUserId);

          // scroll bottom on person detail area
          let scroll_to_bottom = document.getElementById("chatBody");
          scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
        }
        
        // active each person
        $('.surface .main .person .personList.contactsArea .eachPerson.contacts.active').removeClass('active')
        $(`.surface .main .person .personList.contactsArea .eachPerson.contacts[data-id="${p_receiverUserId}"]`).addClass('active')
      }
    },
    error: (response) => {
      toastr.error('You got an error!')
    }
  })

}
// chat (end)



// message (begin)
function sendMessage() {
  let v_message = $(".surface .main .personDetail .footer .text").val();

  if (v_message.trim() != "") {
    let v_receiverUserId = $(".surface .main .personDetail").attr("data-id");
    let v_senderUserId = $(".surface .main .person .profileInfoArea").attr("data-id");

    $.ajax({
      url: "/message/send",
      method: "POST",
      dataType: "json",
      data: {
        receiverUserId: v_receiverUserId,
        text: v_message,
      },
      success: (response) => {
        if (response.status == "success") {

          var socket = io();
          let o_message = {
            senderUserId: v_senderUserId,
            receiverUserId: v_receiverUserId,
            messageId: response.data.messageId,
            messageDate: response.data.messageDate,
            text: v_message,
          };
          socket.emit("add chat message", o_message);

          $(".surface .main .personDetail .footer .text").val("");
        }
      },
      error: (response) => {
        toastr.error("You got an error!");
      },
    });
  }
}

function sendMessageKeyPress(event){
  if(event.keyCode == 13){ // enter key code
    if(!event.shiftKey){  // if it is not shift enter
        sendMessage()
    }
  }
}

function addMessageToHtml(p_senderUserId, p_receiverUserId, p_messageId, p_messageDate,  p_text) {
  v_currentUserId = $('.surface .main .person .profileInfoArea').attr('data-id');
  let messagehtml = '';
  let userType = '';
  let lastMessage = '';

  messagehtml += `<div class="eachMessage `;

  if (v_currentUserId == p_senderUserId){
    messagehtml += "me";
    userType = 'Me: ';
  }
  else if(v_currentUserId == p_receiverUserId){
    messagehtml += "you";
  }

  messagehtml += `" data-id="${p_messageId}">
                  <div class="subRegion">
                      <div class="messageArea">
                          <div class="message">
                              ${p_text}
                          </div>
                          <div class="time">`;

  date = new Date(p_messageDate).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  messagehtml += String(date);

  messagehtml += `     </div>
                          <button class="deleteMessage" onclick="deleteMessage('${p_messageId}')">
                            <i class="far fa-times"></i>
                          </button>
                      </div>
                  </div>
              </div>`;

  // update chat detail
  $(messagehtml).insertAfter('.surface .main .personDetail .body .eachMessage:last-child')

  // update chat
  lastMessage = userType + p_text
  $(`.surface .main .person .personList .eachPerson.active .content .shortDetail`).html(lastMessage)
  $(`.surface .main .person .personList .eachPerson.active .time`).html(date)

  // scroll bottom on person detail area
  let scroll_to_bottom = document.getElementById("chatBody");
  scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
}

function deleteMessage(p_messageId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {

      let v_receiverUserId = $(".surface .main .personDetail").attr("data-id");

      $.ajax({
        url: "/message/delete",
        method: "DELETE",
        dataType: "json",
        data: {
          receiverUserId: v_receiverUserId,
          messageId: p_messageId,
        },
        success: (response) => {
          if (response.status == "success") {
            
            var socket = io()
            let o_message = {
              messageId: p_messageId
            }
            socket.emit('delete chat message', o_message)

            toastr.success("Message has been deleted.");
          }
        },
        error: (response) => {
          toastr.error("You got an error!");
        },
      });
    }
  });
}

function deleteMessageFromHtml(p_messageId) {

  if ($($(`.surface .main .personDetail .body .eachMessage:last-child`).attr('data-id') == p_messageId)) { // then it is last message. So, we need to update chat
    // delete message
    $(`.surface .main .personDetail .body .eachMessage[data-id="${p_messageId}"]`).remove();

    // update chat
    let date = $('.surface .main .personDetail .body .eachMessage:last-child .subRegion .messageArea .time').html()
    let text = $('.surface .main .personDetail .body .eachMessage:last-child .subRegion .messageArea .message').html()
    let userType = '';

    if ($('.surface .main .personDetail .body .eachMessage:last-child').hasClass('me')) {
      userType = 'Me: '
    }

    $('.surface .main .person .personList .eachPerson.active .content .shortDetail').html(userType + text)
    $('.surface .main .person .personList .eachPerson.active .time').html(date)
  }
  else {
    // delete message
    $(`.surface .main .personDetail .body .eachMessage[data-id="${p_messageId}"]`).remove();
  }

}
// message (end)



// profile (begin)
function showProfile() {
  showChatAjaxLoader();

  var socket = io();

  socket.on("msg", (msg) => {
    console.log("chat message");
  });

  $.ajax({
    url: "/profile",
    method: "GET",
    dataType: "json",
    success: (response) => {
      if (response.status == "success") {
        let profilehtml = "";
        let profilename = response.data.name;
        let profileemail = response.data.email;

        // Profile
        profilehtml += `<div class="profileArea" id="profileField">
                            <button class="close" onclick="showChat()" title="Close">
                                <i class="fas fa-times"></i>
                            </button>
                            <img src="/images/default-image.png" class="profileImg" alt="">
                            <div class="formElement">
                                <label for="name">Your Name</label>
                                <input type="text" name="name" id="name" value="${profilename}">
                                <a href="#">
                                    <i class="fas fa-check"></i>
                                </a>
                            </div>
                            <div class="formElement">
                                <label for="email">Your E-mail</label>
                                <input type="text" name="email" id="email" value="${profileemail}">
                                <a href="#">
                                    <i class="fas fa-check"></i>
                                </a>
                            </div>
                            <div class="buttonArea">
                                <button class="updateProfile" onclick="updateProfile()">Apply Changes</button>
                            </div>
                        </div>`;

        hideChatAjaxLoader();
        $("#mainSettingArea >button").removeClass("active");
        $("#mainSettingArea .profile").addClass("active");
        $(profilehtml).insertAfter(".profileInfoArea");
      }
    },
    error: (response) => {
      toastr.error("You got an error!");
    },
  });
}

function updateProfile() {
  // get data
  let name = $('.surface .main .person .profileArea .formElement #name').val()
  let email = $('.surface .main .person .profileArea .formElement #email').val()

  // disable apply changes button
  $('.surface .main .person .profileArea .buttonArea .updateProfile').prop('disabled', true)
  $('.surface .main .person .profileArea .formElement #name').prop('disabled', true)
  $('.surface .main .person .profileArea .formElement #email').prop('disabled', true)


  $.ajax({
    url: '/profile/update',
    method: 'PUT',
    dataType: 'json',
    data: {
      name,
      email
    },
    success: (response) => {
      if (response.status == 'success') {
              
        // enable apply changes button
        $('.surface .main .person .profileArea .buttonArea .updateProfile').prop('disabled', false)
        $('.surface .main .person .profileArea .formElement #name').prop('disabled', false)
        $('.surface .main .person .profileArea .formElement #email').prop('disabled', false)

        // update html of profile
        $('.surface .main .person .profileInfoArea .infoArea .content .name').html(name)
        $('.surface .main .person .profileInfoArea .infoArea .content .shortDetail').html(email)

        toastr.success('Profile has been updated.')
      }
    },
    error: (response) => {
      toastr.error('You got an error!')
    }
  })
}

function showContactsToSendMessage() {
  showChatAjaxLoader();

  $.ajax({
    url: "/person/list",
    method: "GET",
    dataType: "json",
    success: (response) => {
      if (response.status == "success") {
        let contactshtml = "";

        let contactsdata = response.data.contacts;

        // Search
        contactshtml += `<div class="searchMainArea">
                                    <div class="searchArea">
                                        <input type="text" class="search" placeholder="Search">
                                        <i class="fas fa-search"></i>
                                    </div>
                                </div>`;

        // Contacts
        contactshtml += `<div class="personList contactsArea">`;

        for (let i = 0; i < contactsdata.length; i++) {
          contactshtml += `<div class="eachPerson contacts" data-id="${contactsdata[i]._id}">
                                        <hr class="topLine">
                                        <img class="profilePhoto" src="/images/default-image.png" alt="">
                                        <div class="content">
                                            <div class="name">
                                                ${contactsdata[i].name}
                                            </div>
                                            <div class="actions">
                                              <button class="startChat" onclick="startChat('${contactsdata[i]._id}')"><i class="fas fa-comment"></i>Message</button>
                                            </div>
                                        </div>
                                        <hr class="bottomLine">
                                    </div>`;
        }

        contactshtml += `</div>`;

        hideChatAjaxLoader();
        $("#mainSettingArea >button").removeClass("active");
        $("#mainSettingArea .contacts").addClass("active");
        $(contactshtml).insertAfter(".profileInfoArea");
      }
    },
    error: (response) => {
      toastr.error("You got an error!");
    },
  });
}
// profile (end)


