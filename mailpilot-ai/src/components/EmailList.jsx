import EmailItem from "./EmailItem";

function EmailList({ emails }) {
  return (
    <div id="email-list">
      {emails.map((mail, i) => (
        <EmailItem key={i} mail={mail} />
      ))}
    </div>
  );
}

export default EmailList;
