import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [uname, setUname] = useState('');
    const [psw, setPsw] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const res = await loginUser({ uname, psw });
                setMessage(res);
                if (res === 'Login successful') {
                    localStorage.setItem('username', uname);
                    window.location.href = '/dashboard';
                }
            } else {
                const res = await registerUser({ uname, psw, email });
                if (res === 'Registered successfully') {
                    localStorage.setItem('username', uname);
                    window.location.href = '/dashboard';
                }
                setMessage(res);
            }
        } catch (error) {
            setMessage('Error: ' + error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in zoom-in duration-500">
            <div className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black mb-2 tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {isLogin ? 'Enter your credentials to continue' : 'Sign up to access AI features'}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="sai_deep"
                            value={uname}
                            onChange={(e) => setUname(e.target.value)}
                            className="w-full p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-semibold mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="sai@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={psw}
                            onChange={(e) => setPsw(e.target.value)}
                            className="w-full p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center
                        ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {message}
                    </div>
                )}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-500 font-bold hover:underline"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
                {/* Debug Footer */}
                <div className="mt-4 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-[10px] text-slate-400 font-mono text-center">
                    API Endpoint: {import.meta.env.VITE_API_URL || 'http://localhost:8081'}
                </div>
            </div>
        </div>
    );
};
export default Auth;

