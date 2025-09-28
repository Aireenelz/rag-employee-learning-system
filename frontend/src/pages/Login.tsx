import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faEye,
    faEyeSlash,
    faLock,
} from "@fortawesome/free-solid-svg-icons";

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log("Login attempt: ", {email, password, rememberMe});
        alert("Login button 🚧 under construction 🚧")
    };

    return (
        <div className="min-h-screen bg-els-secondarybackground flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-40 mx-auto mb-4 flex items-center justify-center">
                        <img
                            src="/logo_questio.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h1>
                    <p className="text-gray-600">Log in to your account</p>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {/* RememberMe and ForgotPassword */}
                    <div className="flex items-center justify-between pl-1 pb-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-blue-700 border-gray-300 rounded focus:ring-blue-700"
                            />
                            <span className="ml-2 text-sm text-gray-500">Remember me</span>
                        </label>
                        <a href="" className="text-sm text-blue-700 hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* Log in button */}
                    <button
                        type="submit"
                        className="w-full bg-els-primarybutton text-white py-3 px-4 rounded-lg hover:bg-els-primarybuttonhover transition-colors font-medium"
                    >
                        Log In
                    </button>
                </form>

                {/* Sign up if no account */}
                <p className="text-center text-gray-600 mt-10">
                    Don't have an account?{' '}
                    <a href="/signup" className="text-blue-700 hover:underline font-medium">Sign Up</a>
                </p>
            </div>
        </div>
    );
};

export default Login