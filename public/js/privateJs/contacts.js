
$(document).ready(function () {
    // shows contacts html
    $('#myProfileSettings .btnContacts, #mainSettingArea .contacts').on('click', () => {
        showContacts();
    })

    // shows create person html
    $('#myProfileSettings .btnCreatePerson, #mainSettingArea .createPerson').on('click', () => {
        showCreatePerson();
    })
})