import './FeedbackMessage.css';

function FeedbackMessage({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div className={`feedback-message feedback-message--${type}`} role="alert">
      {message}
    </div>
  );
}

export default FeedbackMessage;