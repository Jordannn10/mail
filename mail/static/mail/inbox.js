document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit handler
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  document.querySelector('#compose-reply').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail').style.display = 'none';
  document.querySelector('#compose-reply').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function compose_reply(singleEmail) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail').style.display = 'none';
  document.querySelector('#compose-reply').style.display = 'block';

  document.querySelector('#reply-recipients').value = `${singleEmail.sender}`;
  document.querySelector('#reply-subject').value = '';
  document.querySelector('#reply-body').value = '';
}

function view_email(singleEmail) {
  fetch(`/emails/${singleEmail.id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(singleEmail.id);
      // ... do something else with email ...
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#compose-reply').style.display = 'none';
      document.querySelector('#emails-detail').style.display = 'block';

      // Displaying emails detail
      document.querySelector('#emails-detail').innerHTML = `
      <div class="list-group-item emails-detail">
        <strong>From:</strong> ${singleEmail.sender}<br>
        <strong>To:</strong> ${singleEmail.recipients}<br>
        <strong>Subject:</strong> ${singleEmail.subject}<br>
        <strong>Timestamp:</strong> ${singleEmail.timestamp}<br>
        <br><hr><br>
        ${singleEmail.body}<br>
        <br><hr><br>
      </div>
      `;

      // When clicked email --> Email's read
      fetch(`/emails/${singleEmail.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      });
      
      // Reply button logic
      const btn_reply = document.createElement('button');
      btn_reply.className = 'btn btn-ms btn-outline-info emails-detail';
      btn_reply.innerHTML = 'Reply';
      btn_reply.addEventListener('click', function() {
         console.log('Button is clicked')
         compose_reply(singleEmail)
      });
      document.querySelector('#emails-detail').append(btn_reply);

      // Read button logic
      const btn_read = document.createElement('button');
      btn_read.className = 'btn btn-ms btn-outline-info emails-detail';
      btn_read.innerHTML = singleEmail.read ? 'Mark as unread' : 'Mark as read';
      btn_read.addEventListener('click', function() {
          if (singleEmail.read) {
            fetch(`/emails/${singleEmail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: false
              })
            })
          } else {
            fetch(`/emails/${singleEmail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            })
          }
          load_mailbox('inbox');
      });
      document.querySelector('#emails-detail').append(btn_read);

      // Archive button logic
      const btn_archive = document.createElement('button');
      btn_archive.className = 'btn btn-ms btn-outline-info emails-detail';
      btn_archive.innerHTML = singleEmail.archived ? 'Unarchived' : 'Archived';
      btn_archive.addEventListener('click', function() {
          if (singleEmail.archived) {
            fetch(`/emails/${singleEmail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
          } else {
            fetch(`/emails/${singleEmail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
          }
          load_mailbox('archive');
      });
      document.querySelector('#emails-detail').append(btn_archive);

  });

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail').style.display = 'none';
  document.querySelector('#compose-reply').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails for that mailbox and user
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // Loop through emails
      emails.forEach(singleEmail => {

        // Create div for each email
        const newEmail = document.createElement('div');

        // Change background color
        const emailRead = singleEmail.read ? 'read' : 'unread';
        const emailArchive = singleEmail.archived ? 'archived' : 'unarchived';
        newEmail.innerHTML = `
          <ul>
            <li class="list-group-item list-group-item-action ${emailRead} ${emailArchive}">
              <div class="row">
                <div class="col">
                  <strong>${singleEmail.sender}</strong>
                </div>
                <div class="col-5">
                  ${singleEmail.subject}
                </div>
                <div class="col">
                  ${singleEmail.timestamp}
                </div>
              </div>
            </li>
          </ul>`;

        // Add click event to view email
        newEmail.addEventListener('click', function() {
          view_email(singleEmail)
        });
        document.querySelector('#emails-view').append(newEmail);
      })
  });
}

function send_email() {
  // Store fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  // Send data to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
  
  const reply_recipients = document.querySelector('#reply-recipients').value;
  const reply_subject = document.querySelector('#reply-subject').value;
  const reply_body = document.querySelector('#reply-body').value;
  
  // Send data to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: reply_recipients,
        subject: reply_subject,
        body: reply_body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}

