function AdminPageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-extrabold text-walnut">{eyebrow}</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-stone-500">{description}</p></div>
      {action}
    </header>
  );
}

export default AdminPageHeader;
