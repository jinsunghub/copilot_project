function EmailItem({ mail }) {
    return (
      <div className={`email-item ${mail.isSpam ? "spam" : ""}`}>
        <div className="badge">{mail.category}</div>
        <br />
        <strong>{mail.sender}</strong> - {mail.subject}
        <p>{mail.summary}</p>
        <small>{mail.time}</small>
        <br />
        {mail.priority === "High" && (
          <span style={{ color: "red" }}>⚠️ High Priority</span>
        )}
      </div>
    );
  }
  
  export default EmailItem;
  