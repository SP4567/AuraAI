import logoMark from '../assets/aura-mark.svg'

const BrandLogo = () => (
  <span className="inline-flex items-center gap-2.5 text-[var(--text-primary)]">
    <img className="h-10 w-10" src={logoMark} alt="" aria-hidden="true" />
    <span className="text-2xl font-semibold tracking-tight">
      Aura<span className="ml-1 text-sm font-medium tracking-[0.16em] text-violet-500">AI</span>
    </span>
  </span>
)

export default BrandLogo
