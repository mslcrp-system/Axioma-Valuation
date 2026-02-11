import { Mail, Phone, Globe } from 'lucide-react';

export function CallToActionSlide() {
    return (
        <div className="h-full flex flex-col justify-center px-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">Próximos Passos</h2>

            {/* Main CTA */}
            <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 p-12 rounded-2xl border-2 border-gold-500 mb-12 text-center">
                <h3 className="text-4xl font-bold text-white mb-6">
                    Vamos Transformar Esse Potencial em Realidade?
                </h3>
                <p className="text-2xl text-chumbo-300 mb-8">
                    A Axioma pode ajudar sua empresa a capturar todo esse valor oculto
                </p>
                <div className="inline-block bg-gold-500 text-chumbo-950 px-12 py-4 rounded-xl text-2xl font-bold">
                    Agende uma Consultoria Gratuita
                </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-3 gap-8">
                <div className="flex items-center gap-4 bg-chumbo-800/50 p-6 rounded-xl">
                    <Mail className="w-8 h-8 text-gold-500" />
                    <div>
                        <p className="text-sm text-chumbo-400">Email</p>
                        <p className="text-lg font-semibold text-white">contato@axioma.com.br</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-chumbo-800/50 p-6 rounded-xl">
                    <Phone className="w-8 h-8 text-gold-500" />
                    <div>
                        <p className="text-sm text-chumbo-400">Telefone</p>
                        <p className="text-lg font-semibold text-white">+55 (11) 9999-9999</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-chumbo-800/50 p-6 rounded-xl">
                    <Globe className="w-8 h-8 text-gold-500" />
                    <div>
                        <p className="text-sm text-chumbo-400">Website</p>
                        <p className="text-lg font-semibold text-white">axioma.com.br</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto text-center">
                <p className="text-xl font-bold text-gold-500">AXIOMA</p>
                <p className="text-sm text-chumbo-500">Valuation & Advisory</p>
            </div>
        </div>
    );
}
