function About() {
  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Building the future of developer collaboration
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              ApexDevs is a professional platform where developers showcase projects, 
              share knowledge, and build meaningful connections in the tech community.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We're democratizing project visibility for developers worldwide. Every line of code, 
              every creative solution, and every innovative project deserves to be seen.
            </p>
            <p className="text-gray-300 leading-relaxed">
              ApexDevs bridges the gap between building great software and getting it noticed, 
              helping developers at all levels gain recognition for their work.
            </p>
          </div>
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Quality First</h3>
                  <p className="text-gray-400 text-sm">Curated projects that demonstrate real-world problem solving</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Community Driven</h3>
                  <p className="text-gray-400 text-sm">Built by developers, for developers, with the community at its core</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Open & Transparent</h3>
                  <p className="text-gray-400 text-sm">No algorithmic gatekeeping, just authentic developer work</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-neutral-800/50 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-gray-400 text-lg">Everything you need to showcase your work professionally</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Showcase */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Project Showcase</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload projects with images, descriptions, tech stacks, and live demos. 
                Create a professional portfolio that stands out.
              </p>
            </div>

            {/* Advanced Search */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Filtering</h3>
              <p className="text-gray-400 leading-relaxed">
                Filter projects by technology, category, or tags. Find exactly what you're 
                looking for with powerful search capabilities.
              </p>
            </div>

            {/* Discussion Threads */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Discussions</h3>
              <p className="text-gray-400 leading-relaxed">
                Engage in technical discussions, ask questions, share resources, and 
                collaborate with developers worldwide.
              </p>
            </div>

            {/* Developer Profiles */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Developer Profiles</h3>
              <p className="text-gray-400 leading-relaxed">
                Build your developer brand with customizable profiles, project collections, 
                and contribution history.
              </p>
            </div>

            {/* Project Reviews */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Project Feedback</h3>
              <p className="text-gray-400 leading-relaxed">
                Get constructive feedback from the community. Rate and review projects 
                to help others improve.
              </p>
            </div>

            {/* Real-time Updates */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Stay Connected</h3>
              <p className="text-gray-400 leading-relaxed">
                Follow developers, get notified about new projects, and stay updated 
                with the latest in your tech stack.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-green-500 mb-2">1000+</div>
            <div className="text-gray-400 text-lg">Projects Showcased</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-green-500 mb-2">500+</div>
            <div className="text-gray-400 text-lg">Active Developers</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-green-500 mb-2">50+</div>
            <div className="text-gray-400 text-lg">Technologies</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to showcase your work?</h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Join thousands of developers who are building in public and getting 
            recognized for their contributions to the tech community.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/signup" 
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              Get Started
            </a>
            <a 
              href="/" 
              className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg border border-neutral-700 transition-colors"
            >
              Browse Projects
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
