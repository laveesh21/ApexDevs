function About() {
  return (
    <div className="min-h-screen bg-dark-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-3">About ApexDevs</h1>
          <p className="text-lg text-gray-400">Empowering developers to showcase their creativity</p>
        </div>

        <div className="space-y-12">
          <section className="bg-dark-800 border border-dark-600 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              ApexDevs is a platform dedicated to helping developers from all backgrounds 
              showcase their projects and connect with the global developer community. 
              We believe that every project tells a story, and every developer deserves 
              a platform to share their work.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-6 text-center">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 hover:border-primary/50 transition-all">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Project Showcase</h3>
                <p className="text-gray-400 text-sm">Upload and display your projects with beautiful project cards</p>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 hover:border-primary/50 transition-all">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Smart Filtering</h3>
                <p className="text-gray-400 text-sm">Filter projects by tech stack to find exactly what you're looking for</p>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 hover:border-primary/50 transition-all">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Global Community</h3>
                <p className="text-gray-400 text-sm">Connect with developers from around the world</p>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 hover:border-primary/50 transition-all">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Get Inspired</h3>
                <p className="text-gray-400 text-sm">Discover innovative projects and learn from others</p>
              </div>
            </div>
          </section>

          <section className="bg-dark-800 border border-dark-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Join Us</h2>
            <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Whether you're a beginner sharing your first project or an experienced 
              developer with a portfolio of work, ApexDevs is the place for you. 
              Sign up today and become part of our growing community!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About;
