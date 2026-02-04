export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-ramadan-deep-blue/30 rounded-xl border border-ramadan-sky/20 backdrop-blur-sm items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ramadan-lantern"></div>
      <p className="mt-4 text-ramadan-sand">Chargement de l'Assistant Sadaqa...</p>
    </div>
  );
}
