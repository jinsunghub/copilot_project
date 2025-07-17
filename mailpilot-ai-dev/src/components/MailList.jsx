import React from "react";

const MailList = ({ emails, onSelectEmail }) => {
  return (
    <div className="mail-list">
      {emails.map((email) => (
        <div
          key={email.id}
          className="mail-item"
          onClick={() => onSelectEmail(email)}
        >
          <div className="mail-subject">{email.subject}</div>
          <div className="mail-from">{email.from}</div>
          <div className="mail-date">{email.date}</div>
        </div>
      ))}
    </div>
  );
};

export default MailList;
