export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-brand">
        <h1 className="loading-title">TáNaMão</h1>
        <div className="loading-rule" />
        <p className="loading-sub">carregando</p>
      </div>
    </div>
  )
}
