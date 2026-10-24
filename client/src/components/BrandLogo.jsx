import logoMark from '../assets/aura-mark.svg'

const BrandLogo = ({ light = false }) => (
  <span className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-slate-950'}`}>
    <img className="h-10 w-10" src={logoMark} alt="" aria-hidden="true" />
    <span className="text-2xl font-semibold tracking-tight">
      Aura<span className="ml-1 text-sm font-medium tracking-[0.16em] text-violet-500">AI</span>
    </span>
  </span>
)

export default BrandLogo
