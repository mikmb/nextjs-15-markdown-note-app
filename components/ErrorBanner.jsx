export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      //   style={{ padding: 12, border: "1px solid #f00", marginBottom: 12 }}
      //   className="flex items-center justify-between p-3 mb-4 rounded-md border border-red-400 bg-red-100 text-red-700"
      className="error-banner"
    >
      <strong>Error:</strong> {message}
      {onClose && (
        <button
          onClick={onClose}
          // style={{ marginLeft: 8 }}
          //   className="ml-4 text-sm font-medium text-red-700 hover:text-red-900"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
