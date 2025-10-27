'use client';

export default function UnderConstruction() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8">
      <div className="bg-[#2c3e50] rounded-lg p-8 max-w-xl text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Sayfa Yapým Aþamasýnda</h1>
        <p className="text-gray-300">Bu sayfa geçici olarak devre dýþý býrakýlmýþtýr. Lütfen daha sonra tekrar kontrol edin.</p>
        <p className="text-3xl font-bold text-gray-300 mb-4">___</p>
        <h1 className="text-3xl font-bold text-white mb-4">This Page is Under Construction</h1>
        <p className="text-gray-300">This page is temporarily disabled while we make improvements. Please check back soon.</p>
      </div>
    </div>
  );
}
