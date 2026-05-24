export default function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
}) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow ? <p className="text-sm uppercase tracking-[0.3em] text-orange-600">{eyebrow}</p> : null}
      <h2 className={`mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl ${titleClassName}`}>{title}</h2>
      {description ? (
        <p className={`mt-4 text-base leading-8 text-slate-600 ${descriptionClassName}`}>{description}</p>
      ) : null}
    </div>
  );
}
