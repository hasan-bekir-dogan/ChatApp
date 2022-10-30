
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
          contactshtml += `<div class="eachPerson contacts">
                                        <hr class="topLine">
                                        <img class="profilePhoto" src="/images/default-image.png" alt="">
                                        <div class="content">
                                            <div class="name">
                                                ${contactsdata[i].name}
                                            </div>
                                            <div class="actions">
                                              <button class="editPerson"><i class="fas fa-edit"></i>Edit</button>
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
                        <img src="/images/default-image.png" class="profileImg" alt="Profile Photo">
                        <div class="nameArea">
                            <label for="personName">Name</label>
                            <input type="text" name="personName" id="personName">
                        </div>
                        <div class="nameArea">
                            <label for="personEmail">E-mail</label>
                            <input type="text" name="personEmail" id="personEmail">
                        </div>
                        <div class="buttonsArea">
                            <button class="cancel" id="cancelCreationPerson">Cancel</button>
                            <button class="create" id="createPerson">Create</button>
                        </div>
                    </div>`;

  hideChatAjaxLoader();
  $("#mainSettingArea >button").removeClass("active");
  $("#mainSettingArea .contacts").addClass("active");
  $(createpersonhtml).insertAfter(".profileInfoArea");
}

function createPerson() {
  showChatAjaxLoader();

  let personemail = $("#personEmail").val();

  $("#createPerson").prop("disabled", true);
  $("#cancelCreationPerson").prop("disabled", true);

  $.ajax({
    url: "/person/create",
    method: "POST",
    dataType: "json",
    data: {
      email: personemail,
    },
    success: (response) => {
      if (response.status == "success") {
        toastr.success("The person successfully added to contacts.");

        let contactshtml = "";

        let contactsdata = response.data.contacts;

        // Search
        contactshtml += `<div class="searchMainArea">
                                        <div class="searchArea">
                                            <input type="text" class="search" placeholder="Search">
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <button class="newChatButton" onclick="showContacts()" title="Close">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>`;

        // Contacts
        contactshtml += `<div class="personList contactsArea">`;

        for (let i = 0; i < contactsdata.length; i++) {
          contactshtml += `<div class="eachPerson contacts">
                                            <hr class="topLine">
                                            <img class="profilePhoto" src="/images/profile-photo3.png" alt="">
                                            <div class="content">
                                                <div class="name">
                                                    ${contactsdata[i].name}
                                                </div>
                                            </div>
                                            <hr class="bottomLine">
                                        </div>`;
        }

        contactshtml += `</div>`;

        $("#createPerson").prop("disabled", false);
        $("#cancelCreationPerson").prop("disabled", false);

        hideChatAjaxLoader();
        $("#mainSettingArea >button").removeClass("active");
        $("#mainSettingArea .contacts").addClass("active");
        $(contactshtml).insertAfter(".profileInfoArea");
      }
    },
    error: (response) => {
      toastr.error("You got an error!");

      $("#createPerson").prop("disabled", false);
      $("#cancelCreationPerson").prop("disabled", false);
    },
  });
}

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
          
          if (chat[i].type == 'sender'){
            chathtml += 'Me: ';
          }

          chathtml += `             ${chat[i].lastMessage}
                                </div>
                            </div>
                            <div class="time">`;
          
          date = new Date(chat[i].date).toLocaleDateString('en-GB', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"}) ;

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
      receiverUserId: p_receiverUserId
    },
    success: (response) => {
      if (response.status == "success") {
        let chatdetailhtml = "";
        let chatmaindetailhtml = '';
        let messages = response.data.messages;
        let receiverName = response.data.recevierName;
        let receiverEmail = response.data.recevierEmail;
        let date;
        let message = '', endOfDate;
        
        // Chat each message
        for (let i = 0; i < messages.length; i++) {
          chatdetailhtml += `<div class="eachMessage `; 

          if (messages[i].usertype == 'sender')
            chatdetailhtml += 'me';
          else
            chatdetailhtml += 'you';

          chatdetailhtml += `">
                          <div class="subRegion">
                              <div class="messageArea">
                                  <div class="message">
                                      ${messages[i].text}
                                  </div>
                                  <div class="time">`;
          date = new Date(messages[i].createdAt).toLocaleDateString('en-GB', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"}) ;

          chatdetailhtml += String(date);
                                      
          chatdetailhtml += `     </div>
                                  <button class="deleteMessage" onclick="deleteMessage('${messages[i]._id}')">
                                    <i class="far fa-times"></i>
                                  </button>
                              </div>
                          </div>
                      </div>`;

          if (i == (messages.length - 1)) {
            if (messages[i].usertype == 'sender')
              message += 'Me: ';
            
            message += messages[i].text;
            endOfDate = date;
          }
        }

        if ($('.surface .main .personDetail').hasClass('mainPage')){
          
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
                                      <textarea class="text" name="text" placeholder="Type a message"></textarea>
                                      <button class="sendButton" onclick="sendMessage()">
                                          <i class="fas fa-paper-plane"></i>
                                      </button>
                                  </div>`;
          
          $('.surface .main .personDetail').removeClass('mainPage');
          $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"]`).addClass('active')
          
          $(".surface .main .personDetail").html(chatmaindetailhtml);          
        }
        else{
          
          // set receiver name and email in detail side
          $('.personDetail .header .infoArea .content .name').html(receiverName);
          $('.personDetail .header .infoArea .content .shortDetail').html(receiverEmail);

          // hide ajax loader
          hideChatDetailAjaxLoader();

          // set chat detail body
          $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"]`).addClass('active')
          
          $(".surface .main .personDetail .body").html(chatdetailhtml);

        }

        $('.surface .main .personDetail').attr('data-id', p_receiverUserId)

        // scroll bottom on person detail area
        let scroll_to_bottom = document.getElementById('chatBody');
		    scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;

        // set active person info
        $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"] .content .shortDetail`).html(message)
        $(`.surface .main .person .personList .eachPerson[data-id="${p_receiverUserId}"] .time`).html(endOfDate)
      }
    },
    error: (response) => {
      toastr.error("You got an error!");
    },
  });
}

function showProfile() {
  showChatAjaxLoader();

  var socket = io();

  socket.on('msg', (msg) => {
    console.log('chat message')
  })
  
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
                            <div class="nameArea">
                                <label for="name">Your Name</label>
                                <input type="text" name="name" id="name" value="${profilename}">
                                <a href="#">
                                    <i class="fas fa-check"></i>
                                </a>
                            </div>
                            <div class="nameArea">
                                <label for="name">Your E-mail</label>
                                <input type="text" name="email" id="email" value="${profileemail}">
                                <a href="#">
                                    <i class="fas fa-check"></i>
                                </a>
                            </div>
                            <div class="buttonArea">
                                <button class="updateProfile">Apply Changes</button>
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
          contactshtml += `<div class="eachPerson contacts">
                                        <hr class="topLine">
                                        <img class="profilePhoto" src="/images/profile-photo3.png" alt="">
                                        <div class="content">
                                            <div class="name">
                                                ${contactsdata[i].name}
                                            </div>
                                            <div class="actions">
                                              <button class="startChat"><i class="fas fa-comment"></i>Message</button>
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

function sendMessage() {
  let v_message = $('.surface .main .personDetail .footer .text').val();

  if(v_message.trim() != '') {
    //showChatDetailAjaxLoader();

    let v_receiverUserId = $('.surface .main .personDetail').attr('data-id');

    $.ajax({
      url: "/message/send",
      method: "POST",
      dataType: "json",
      data: {
        receiverUserId: v_receiverUserId,
        text: v_message
      },
      success: (response) => {
        if (response.status == "success") {

          showChatDetail(v_receiverUserId);

          var socket = io();
          socket.emit('chat message', v_message);

          $('.surface .main .personDetail .footer .text').val('')

        }
      },
      error: (response) => {
        toastr.error("You got an error!");
      },
    });
  }
}

function deleteMessage(p_messageId) {

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
          
      showChatDetailAjaxLoader();

      let v_receiverUserId = $('.surface .main .personDetail').attr('data-id');

      $.ajax({
        url: "/message/delete",
        method: "DELETE",
        dataType: "json",
        data: {
          receiverUserId: v_receiverUserId,
          messageId: p_messageId
        },
        success: (response) => {
          if (response.status == "success") {
            showChatDetail(v_receiverUserId);
            
            toastr.success("Message has been deleted.");
          }
        },
        error: (response) => {
          toastr.error("You got an error!");
        },
      });
      
    }
  })
  
}
