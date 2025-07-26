// src/components/Footer.jsx
import { FaTwitter, FaLinkedin, FaGithub, FaChartLine, FaShieldAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <FaChartLine className="text-blue-400 text-2xl mr-2" />
                <h2 className="text-xl font-bold text-white">FinInsight</h2>
              </div>
              <p className="text-sm mb-4">
                Advanced financial analytics and market insights for informed investment decisions.
              </p>
              <div className="flex space-x-4">
                <a href="#" aria-label="Twitter" className="text-blue-500 hover:text-white transition-colors">
                  <FaTwitter />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-blue-500 hover:text-white transition-colors">
                  <FaLinkedin />
                </a>
                <a href="#" aria-label="GitHub" className="text-blue-500 hover:text-white transition-colors">
                  <FaGithub />
                </a>
              </div>
            </div>


            <div>
              <h3 className="text-lg font-semibold text-white mb-2 border-b border-blue-700 pb-1">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Market Overview</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Stock Analysis</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Portfolio Tracker</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Economic Calendar</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Research Reports</a></li>
              </ul>
            </div>


            <div>
              <h3 className="text-lg font-semibold text-white mb-2 border-b border-blue-700 pb-1">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Risk Disclosure</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Compliance</a></li>
                <li><a href="#" className="text-blue-500 hover:text-white transition-colors">Data Protection</a></li>
              </ul>
            </div>


            <div>
              <h3 className="text-lg font-semibold text-white mb-2 border-b border-blue-700 pb-1">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaEnvelope className="mt-1 mr-2 text-blue-500" />
                  <span>support@fininsight.com</span>
                </li>
                <li className="flex items-start">
                  <FaPhone className="mt-1 mr-2 text-blue-500" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start">
                  <FaShieldAlt className="mt-1 mr-2 text-blue-500" />
                  <span>24/7 Financial Support</span>
                </li>
              </ul>
            </div>
        </div>
        <div className="container mx-auto px-4 mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
            <p>
                © {currentYear} FinInsight Analytics. All rights reserved.
              </p>
            <p>
              Investment decisions should not be made based solely on our analytics. Past performance is not indicative of future results.
            </p>
        </div>
      </footer>
    );
};
  
export default Footer;
  