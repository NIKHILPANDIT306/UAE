import councilLogo from '../assets/logo.png';
import nfrLogo from '../assets/newr.png';

export default function BrandHeader() {
  return (
    <header className="brand-header">
      <div className="brand-header-content">
        <img
          className="brand-logo brand-logo-council"
          src={councilLogo}
          alt="The UAE Council for Fatwa"
        />
        <img
          className="brand-logo brand-logo-nfr"
          src={nfrLogo}
          alt="NFR Analytics"
        />
      </div>
    </header>
  );
}
