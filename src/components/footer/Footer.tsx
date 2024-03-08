export default function Footer() {
  return (
    <footer className="w-full bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-white">
      <div className="flex h-8 items-center justify-center">
        <p>© {new Date().getFullYear()} YATS</p>
      </div>
    </footer>
  );
}
