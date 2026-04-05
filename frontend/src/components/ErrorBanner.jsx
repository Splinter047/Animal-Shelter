export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="banner error" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="btn tiny ghost" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
