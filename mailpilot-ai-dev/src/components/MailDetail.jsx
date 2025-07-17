import React from "react";

const MailDetail = ({ email }) => {
  if (!email)
    return <div className="mail-detail empty">📭 메일을 선택해주세요</div>;

  return (
    <div className="mail-detail">
      <h2>{email.subject}</h2>
      <p>
        <strong>보낸 사람:</strong> {email.from}
      </p>
      <p>
        <strong>받은 날짜:</strong> {email.date}
      </p>
      <hr />
      <p>{email.body}</p>
    </div>
  );
};

export default MailDetail;
