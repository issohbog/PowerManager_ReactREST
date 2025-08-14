
const Section = ({ title, actionText, onAction, children }) => {
  return (
    <div className="dashboard-section">
      <div className="dashboard-title-row">
        <h3 className="dashboard-title">{title}</h3>
        {actionText && (
          <button onClick={onAction} className="dashboard-action-btn">
            {actionText}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
export default Section;