import { HelpCircle } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../js/firebase";
import { loginWithGoogle, logout } from "../js/auth";

export default function Header({ onOpenInstructions = () => {} }) {
  const [user, loading] = useAuthState(auth);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenInstructions}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="How to play"
            >
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 
              style={{ fontFamily: "'EB Garamond', serif" }} 
              className="text-3xl sm:text-4xl font-bold tracking-wide"
            >
              WikiLinks
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {loading ? null : user ? (
              <>
                <span className="text-gray-700 text-sm font-medium">{user.displayName}</span>
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                <button
                  onClick={logout}
                  className="px-4 py-1.5 rounded-full bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}