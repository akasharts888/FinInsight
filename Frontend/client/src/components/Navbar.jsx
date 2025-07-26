import { React , useState, useEffect} from "react";
import { useNavigate, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { FiLogOut, FiMenu, FiX, FiBook, FiMessageSquare, FiAward, FiBarChart2 } from 'react-icons/fi'

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/'); 
  };
  return (
    <>
      {scrolled && (
            <motion.div
              className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 z-50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4 }}
            />
      )}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-md dark:bg-gray-900' : 'bg-white/95 backdrop-blur-sm dark:bg-gray-900/90'}`}
      >
        <nav className="w-full bg-white/90 backdrop-blur-md shadow-lg py-4 px-8 flex items-center justify-between sticky top-0 z-50 animate-fade-in-down border-b border-gray-200">
          {/* <div className="flex items-center gap-3">
            <a href="/" className="text-3xl font-black text-indigo-600 tracking-tight">FinInsight</a>
          </div> */}
          <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="group text-4xl font-extrabold relative flex items-center gap-1 transition hover:scale-105 hover:drop-shadow-md">
                {/* <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                  MentorIQ
                </span> */}
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-[#2C5282] to-[#2B6CB0] bg-clip-text text-transparent"
                >
                  Fin
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent"
                >
                  Insight
                </motion.span>
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-[#2C5282] via-[#FBBF24] to-[#F59E0B] transition-all duration-500 group-hover:w-full" />
                {/* <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400" /> */}
              </Link>
          </motion.div>
          <div className="hidden lg:flex items-center gap-8">
            {isAuthenticated && (
              <div className="relative flex items-center gap-6">
                <a href="/stock"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
                >
                  Search
                </a>
                <a href="/analysis"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
                >
                  Insights
                </a>
                <a href="/prediction"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
                >
                  Predictions
                </a>
                <a href="#"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
                >
                  Contact
                </a>
              </div>
            )}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="ml-2"
            >
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl"
                  title="Log out"
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              )}
            </motion.div>
          </div>
        </nav>
      </motion.header>
    </>
  )
};

export default Navbar; 