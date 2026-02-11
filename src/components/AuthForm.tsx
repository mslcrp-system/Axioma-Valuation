import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { AlertCircle, CheckCircle2, Calculator } from 'lucide-react';

export function AuthForm() {
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Conta criada! Verifique seu email para confirmar.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao autenticar.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-chumbo-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

            <Card className="w-full max-w-md border-chumbo-800 bg-chumbo-900/50 backdrop-blur-md shadow-2xl relative z-10">
                <CardHeader className="space-y-4">
                    <div className="mx-auto bg-gradient-to-br from-gold-500/20 to-gold-500/5 p-3 rounded-2xl border border-gold-500/20 w-fit">
                        <Calculator className="w-8 h-8 text-gold-500" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-center bg-gradient-to-r from-white to-chumbo-400 bg-clip-text text-transparent font-bold">Axioma Valuation</CardTitle>
                        <CardDescription className="text-center text-chumbo-400 mt-2">
                            {isLogin ? 'Entre para acessar seus valuations' : 'Crie sua conta profissional'}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-chumbo-300">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                    required
                                    className="bg-chumbo-950 border-chumbo-800 text-white focus:border-gold-500"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-chumbo-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="bg-chumbo-950 border-chumbo-800 text-white focus:border-gold-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-chumbo-300">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="bg-chumbo-950 border-chumbo-800 text-white focus:border-gold-500"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md flex items-start gap-2 text-sm ${message.type === 'error' ? 'bg-red-900/20 text-red-200 border border-red-900/30' : 'bg-green-900/20 text-green-200 border border-green-900/30'
                                }`}>
                                {message.type === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 mt-0.5" />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gold-500 hover:bg-gold-600 text-chumbo-950 font-bold py-2 rounded-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            disabled={loading}
                        >
                            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                        </Button>

                        <div className="text-center text-sm text-chumbo-400">
                            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                            <button
                                type="button"
                                className="text-gold-500 hover:text-gold-400 underline font-medium"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setMessage(null);
                                }}
                            >
                                {isLogin ? 'Cadastre-se' : 'Faça login'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
