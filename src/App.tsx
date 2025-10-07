import './App.css'

function App() {
  return (
    <main className="min-h-screen grid place-items-center bg-gray-50">
      <section className="max-w-md w-full p-8 rounded-2xl shadow bg-white">
        <h1 className="text-2xl font-bold">React + Vite + Tailwind</h1>
        <p className="mt-2 text-gray-600">
          Tá tudo pronto! Edite <code>src/App.tsx</code> e curta o HMR do Vite.
        </p>
        <button className="mt-6 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
          Botão estiloso
        </button>
      </section>
    </main>
  )
}

export default App
