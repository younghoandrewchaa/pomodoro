interface Props {
  onInstall: () => void;
}

export default function UpdateBanner({ onInstall }: Props) {
  return (
    <div className="update-banner">
      <span className="update-banner__text">A new version is ready.</span>
      <button className="update-banner__btn" onClick={onInstall}>
        Restart to update
      </button>
    </div>
  );
}
