'use client';

export default function UnderConstruction() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8">
      <div className="bg-[#2c3e50] rounded-lg p-8 max-w-xl text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Şu anda, yarı final oylamaları devam etmekte. Oy kullanmak için <a href="https://eurotr.vercel.app/eurovision2020/semi-final-b" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">Yarı Final B Gurubu</a> linkine gidin.
        </h1>
        <p className="text-gray-300">Bu sayfa yarı finaller sonuçlanana kadar devre dışı bırakılmıştır.</p>
        <p className="text-3xl font-bold text-gray-300 mb-4">🚧🚧🚧🚧</p>
        <h1 className="text-3xl font-bold text-white mb-4">
          Currently, the Semi-Finals voting is ongoing. To vote, please visit <a href="https://eurotr.vercel.app/eurovision2020/semi-final-b" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">Semi-Final B Group</a>.
        </h1>
        <p className="text-gray-300">This page is disabled until the Semi-Finals results are announced.</p>
      </div>
    </div>
  );
}