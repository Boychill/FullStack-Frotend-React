import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import Carousel from '../components/ui/Carousel';

const Home = () => {
    return (
        <div className="space-y-20 animate-fade-in pb-12">
            {/* Hero Section */}
            <div className="relative bg-primary-900 rounded-[2.5rem] overflow-hidden shadow-2xl mx-2 sm:mx-0">
                <div className="absolute inset-0">
                    <img
                        className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
                        alt="Shopping"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/80 to-transparent"></div>
                </div>
                <div className="relative max-w-7xl mx-auto py-24 px-6 sm:py-32 lg:px-12 flex flex-col justify-center min-h-[600px]">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-800/50 text-primary-200 text-sm font-semibold mb-6 w-fit backdrop-blur-sm border border-primary-700/50">
                        Nueva Colección 2024
                    </span>
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl max-w-4xl leading-tight">
                        Redefine tu Estilo <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">
                            Sin Límites
                        </span>
                    </h1>
                    <p className="mt-8 text-xl text-primary-100 max-w-2xl leading-relaxed">
                        Explora una selección curada de moda premium y tecnología de vanguardia.
                        Diseño sofisticado para quienes buscan exclusividad y calidad.
                    </p>
                    <div className="mt-12 flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/catalog"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-2xl text-primary-900 bg-white hover:bg-primary-50 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                        >
                            Explorar Catálogo
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-200 text-lg font-semibold rounded-2xl text-primary-100 hover:bg-primary-800/50 hover:text-white transition-all backdrop-blur-sm"
                        >
                            Unirse al Club
                        </Link>
                    </div>
                </div>
            </div>

            {/* Carousel Section */}
            <Carousel />

            {/* Features Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-primary-50 rounded-xl">
                        <Star className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Calidad Premium</h3>
                        <p className="text-sm text-gray-500">Productos seleccionados por expertos</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-primary-50 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Últimas Tendencias</h3>
                        <p className="text-sm text-gray-500">Mantente siempre a la vanguardia</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-primary-50 rounded-xl">
                        <ShieldCheck className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Garantía Segura</h3>
                        <p className="text-sm text-gray-500">Compras protegidas al 100%</p>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Categorías Destacadas</h2>
                        <p className="text-gray-500 mt-2">Encuentra exactamente lo que buscas</p>
                    </div>
                    <Link to="/catalog" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center">
                        Ver todo <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group relative h-96 rounded-[2rem] overflow-hidden shadow-lg cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Moda"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
                            <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                <span className="text-primary-300 font-medium tracking-wider text-sm uppercase mb-2 block animate-slide-up">Estilo de Vida</span>
                                <h3 className="text-4xl font-bold text-white mb-4">Moda & Accesorios</h3>
                                <div className="h-1 w-20 bg-primary-500 rounded-full mb-4"></div>
                                <span className="text-white/90 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    Explorar colección <ArrowRight className="ml-2 w-5 h-5" />
                                </span>
                            </div>
                        </div>
                        <Link to="/catalog?category=clothing" className="absolute inset-0" />
                    </div>

                    <div className="group relative h-96 rounded-[2rem] overflow-hidden shadow-lg cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Tecnología"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
                            <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                <span className="text-primary-300 font-medium tracking-wider text-sm uppercase mb-2 block animate-slide-up">Innovación</span>
                                <h3 className="text-4xl font-bold text-white mb-4">Tecnología</h3>
                                <div className="h-1 w-20 bg-primary-500 rounded-full mb-4"></div>
                                <span className="text-white/90 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    Ver gadgets <ArrowRight className="ml-2 w-5 h-5" />
                                </span>
                            </div>
                        </div>
                        <Link to="/catalog?category=technology" className="absolute inset-0" />
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-gray-900 rounded-[2rem] mx-4 py-16 px-6 sm:px-16 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4">Únete a nuestra comunidad</h2>
                    <p className="text-gray-400 mb-8">Recibe ofertas exclusivas y las últimas novedades directamente en tu inbox.</p>
                    <form className="flex flex-col sm:flex-row gap-4">
                        <input type="email" placeholder="Tu correo electrónico" className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-sm" />
                        <button type="button" className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/50">
                            Suscribirse
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Home;
