import DashboardLayout from '../components/layout/DashboardLayout'

const Home = () => {
  return (
    <DashboardLayout activeItem="home">
      <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse"></div>
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.1),transparent_50%)] animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>
        <div className="relative h-full flex items-start justify-center pt-20 md:pt-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">Bem vindo</h1>
            <p className="text-xl md:text-2xl text-gray-700 font-medium">
              Selecione uma opcao no menu para continuar.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Home
