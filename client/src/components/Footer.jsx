import { Link } from 'react-router-dom';
import logo from '../assets/ApexDevsLogo.png';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 border-t border-neutral-600 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ApexDevs" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-100">ApexDevs</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              A platform for developers to showcase their projects, collaborate, 
              and learn from the community. Build, share, and grow together.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-gray-400 hover:text-primary transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-gray-400 hover:text-primary transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-gray-400 hover:text-primary transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-400 hover:text-primary transition-colors">Browse Projects</Link></li>
              <li><Link to="/community" className="text-sm text-gray-400 hover:text-primary transition-colors">Community</Link></li>
              <li><Link to="/about" className="text-sm text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
              <li><a href="#features" className="text-sm text-gray-400 hover:text-primary transition-colors">Features</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#documentation" className="text-sm text-gray-400 hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#tutorials" className="text-sm text-gray-400 hover:text-primary transition-colors">Tutorials</a></li>
              <li><a href="#api" className="text-sm text-gray-400 hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#blog" className="text-sm text-gray-400 hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#help" className="text-sm text-gray-400 hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#contact" className="text-sm text-gray-400 hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#faq" className="text-sm text-gray-400 hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#feedback" className="text-sm text-gray-400 hover:text-primary transition-colors">Feedback</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-sm text-gray-400 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="text-sm text-gray-400 hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#cookies" className="text-sm text-gray-400 hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#guidelines" className="text-sm text-gray-400 hover:text-primary transition-colors">Community Guidelines</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 mt-8 border-t border-neutral-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} ApexDevs. All rights reserved. Built with ❤️ by developers, for developers.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <a href="#sitemap" className="hover:text-primary transition-colors">Sitemap</a>
            <span>•</span>
            <a href="#status" className="hover:text-primary transition-colors">Status</a>
            <span>•</span>
            <a href="#security" className="hover:text-primary transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
